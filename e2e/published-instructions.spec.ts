import { expect, test, type Page } from '@playwright/test'

const currentSection = {
  academicYear: '115',
  revisionNumber: 1,
  sectionKey: 'competition-rules',
  title: '競賽成果申請辦法',
  content:
    '## 申請資格\n\n符合資格者可提出申請。\n\n[外部參考](https://example.com/rules)',
  displayOrder: 1,
  effectiveFrom: '2026-08-01',
  effectiveTo: null,
}

const historicalSection = {
  ...currentSection,
  academicYear: '114',
  revisionNumber: 2,
  sectionKey: 'competition-rules-114',
  title: '114 學年度競賽成果申請辦法',
  content: '## 歷史規定\n\n歷史辦法內容。',
  effectiveFrom: '2025-08-01',
  effectiveTo: '2026-07-31',
}

async function mockPublishedInstructions(page: Page) {
  const requests: string[] = []

  await page.route('**/public/application-instructions?**', async (route) => {
    const url = new URL(route.request().url())
    requests.push(url.search)
    const applicationType = url.searchParams.get('applicationType')
    const academicYear = url.searchParams.get('academicYear')
    const data =
      applicationType !== 'competition'
        ? []
        : academicYear === '114'
          ? [historicalSection]
          : academicYear === '115'
            ? [currentSection]
            : [currentSection, historicalSection]

    await route.fulfill({ json: { data } })
  })

  return requests
}

test('is public, starts unselected, and sends no request before selection', async ({
  page,
}) => {
  const requests = await mockPublishedInstructions(page)

  await page.goto('/rules')

  await expect(page).toHaveURL(/\/rules$/)
  await expect(
    page.getByRole('heading', { name: '請選擇申請類型' }),
  ).toBeVisible()
  await expect(page.getByLabel('學年度')).toHaveCount(0)
  await expect(page.getByRole('group', { name: '申請類型' }).getByRole('button')).toHaveCount(4)
  expect(requests).toEqual([])
})

test('loads the current year, navigates the table of contents, and switches years', async ({
  page,
}) => {
  const requests = await mockPublishedInstructions(page)
  await page.goto('/rules')

  await page.getByRole('button', { name: '競賽申請' }).click()

  await expect(page.getByLabel('學年度')).toHaveValue('115')
  await expect(
    page.getByRole('heading', { name: '競賽成果申請辦法' }),
  ).toBeVisible()
  const tocLink = page
    .getByRole('navigation', { name: '辦法目錄' })
    .getByRole('link', { name: '申請資格' })
  await expect(tocLink).toHaveAttribute('href', '#申請資格')
  await tocLink.click()
  expect(decodeURIComponent(page.url())).toMatch(/#申請資格$/)
  await expect(page.getByRole('link', { name: '外部參考' })).toHaveAttribute(
    'rel',
    'noopener noreferrer',
  )

  await page.getByLabel('學年度').selectOption('114')
  await expect(
    page.getByRole('heading', { name: '114 學年度競賽成果申請辦法' }),
  ).toBeVisible()
  expect(requests.some((search) => search.includes('academicYear=114'))).toBe(true)
})

test('shows an empty state after a retryable failure', async ({ page }) => {
  let shouldFail = true
  await page.route('**/public/application-instructions?**', async (route) => {
    if (shouldFail) {
      await route.fulfill({ status: 503, json: { code: 'unavailable' } })
      return
    }

    await route.fulfill({ json: { data: [] } })
  })
  await page.goto('/rules')
  await page.getByRole('button', { name: '展覽申請' }).click()

  await expect(page.getByRole('alert')).toContainText('暫時無法載入申請辦法')
  shouldFail = false
  await page.getByRole('button', { name: '重新載入' }).click()
  await expect(
    page.getByRole('heading', { name: '此學年度目前沒有公開辦法' }),
  ).toBeVisible()
})

for (const viewport of [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 360, height: 800 },
]) {
  test(`keeps ${viewport.name} controls usable without horizontal overflow`, async ({
    page,
  }) => {
    await mockPublishedInstructions(page)
    await page.setViewportSize(viewport)
    await page.goto('/rules')

    const buttons = page
      .getByRole('group', { name: '申請類型' })
      .getByRole('button')
    for (let index = 0; index < 4; index += 1) {
      const box = await buttons.nth(index).boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeGreaterThanOrEqual(44)
    }

    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: '跳到主要內容' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: '開始申請' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: '申請辦法' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: '競賽申請' })).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.getByLabel('學年度')).toBeVisible()
    const widths = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth)
  })
}
