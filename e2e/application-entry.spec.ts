import { expect, test } from '@playwright/test'

const applicationLinks = [
  ['競賽申請', '/apply/competition', '學生與參與者資料'],
  [
    '參與計畫申請',
    '/apply/project-participation',
    '參與計畫申請表單準備中',
  ],
  ['證照申請', '/apply/certificate', '證照申請表單準備中'],
  ['展覽申請', '/apply/exhibition', '展覽申請表單準備中'],
] as const

test('redirects to the application entry and exposes keyboard navigation', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/apply$/)
  await expect(
    page.getByRole('heading', { name: '請選擇申請類型' }),
  ).toBeVisible()

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '跳到主要內容' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '開始申請' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '申請辦法' })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: '競賽申請' })).toBeFocused()
})

test('navigates to every public application boundary and the rules boundary', async ({
  page,
}) => {
  await page.route('**/public/competition-point-options', (route) =>
    route.fulfill({
      json: {
        data: [
          {
            competitionLevel: 'national_integrated',
            award: 'finalist',
            allocationMethod: 'per_person',
            points: '3.00',
            minimumPointsPerParticipant: '0.50',
            pointIncrement: '0.50',
          },
        ],
      },
    }),
  )

  for (const [label, route, heading] of applicationLinks) {
    await page.goto('/apply')
    await page.getByRole('main').getByRole('link', { name: label }).click()
    await expect(page).toHaveURL(new RegExp(`${route}$`))
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  }

  await page.getByRole('link', { name: '申請辦法' }).click()
  await expect(page).toHaveURL(/\/rules$/)
  await expect(
    page.getByRole('heading', { name: '請選擇申請類型' }),
  ).toBeVisible()
})

for (const viewport of [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'mobile', width: 360, height: 800 },
]) {
  test(`keeps the ${viewport.name} entry usable without horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto('/apply')

    const main = page.getByRole('main')
    await expect(main.getByText(/適用情境|附件|查看申請辦法/)).toHaveCount(0)
    await expect(main.getByText(/\d+.*人/)).toHaveCount(0)

    for (const [label] of applicationLinks) {
      const box = await main.getByRole('link', { name: label }).boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeGreaterThanOrEqual(44)
    }

    const widths = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth)
  })
}
