import { expect, test, type Page } from '@playwright/test'

const pointOptions = [
  {
    competitionLevel: 'national_integrated',
    award: 'finalist',
    allocationMethod: 'per_person',
    points: '3.00',
    minimumPointsPerParticipant: '0.50',
    pointsIncrement: '0.50',
  },
  {
    competitionLevel: 'national_integrated',
    award: 'first_place',
    allocationMethod: 'shared_total',
    points: '60.00',
    minimumPointsPerParticipant: '0.50',
    pointsIncrement: '0.50',
  },
]

const advisors = [
  {
    id: 10,
    name: '陳老師',
    titleCode: 6,
    department: '多媒體設計系',
    isDirector: false,
  },
]

const success = {
  data: {
    publicId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'pending_advisor',
    submittedAt: '2026-08-13T02:20:30.000Z',
  },
}

async function mockQueries(page: Page) {
  let ruleRequests = 0
  let advisorRequests = 0
  await page.route('**/public/competition-point-options', async (route) => {
    ruleRequests += 1
    await route.fulfill({ json: { data: pointOptions } })
  })
  await page.route('**/public/advisors', async (route) => {
    advisorRequests += 1
    await route.fulfill({ json: { data: advisors } })
  })
  return {
    get advisorRequests() {
      return advisorRequests
    },
    get ruleRequests() {
      return ruleRequests
    },
  }
}

async function completeCommonFirstStep(page: Page, twoParticipants = false) {
  await page.getByLabel('姓名').first().fill('王小明')
  await page.getByLabel('學號').first().fill('4a0x0001')
  if (twoParticipants) {
    await page.getByRole('button', { name: '新增參與者' }).click()
    await page.getByLabel('姓名').nth(1).fill('陳小華')
    await page.getByLabel('學號').nth(1).fill('4a0x0002')
  }
  await page.getByLabel('申請人 Email').fill(' STUDENT@EXAMPLE.COM ')
  await page.getByLabel('申請人電話').fill('0912-345-678')
  await page.getByRole('button', { name: '下一步' }).click()
}

async function completeDetails(
  page: Page,
  award: 'finalist' | 'first_place',
) {
  await page.getByLabel('競賽等級').selectOption('national_integrated')
  await page.getByLabel('獎項').selectOption(award)
  await page.getByLabel('競賽名稱').fill('全國數位設計競賽')
  await page.getByLabel('競賽類別').fill('遊戲設計組')
  await page.getByLabel('競賽日期').fill('2026-08-01')
}

async function completeAdvisorAndAttachment(page: Page) {
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByRole('radio', { name: /陳老師/ }).check()
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByLabel('新增附件').setInputFiles({
    name: 'participation-proof.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test proof'),
  })
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByRole('heading', { name: '確認送出' })).toBeVisible()
}

test('submits a shared-total application and preserves normalized payload values', async ({
  page,
}) => {
  const requests = await mockQueries(page)
  let submittedBody = ''
  await page.route('**/public/applications', async (route) => {
    submittedBody = route.request().postData() ?? ''
    await route.fulfill({ status: 201, json: success })
  })

  await page.goto('/apply/competition')
  await completeCommonFirstStep(page, true)
  await completeDetails(page, 'first_place')

  const points = page.getByLabel('申請點數')
  await expect(points).toHaveCount(2)
  await points.nth(0).fill('20.00')
  await points.nth(1).fill('40.00')
  await expect(page.getByText('已分配 60.00 點；剩餘 0.00 點。')).toBeVisible()
  await completeAdvisorAndAttachment(page)
  await page.getByRole('button', { name: '確認送出申請' }).click()

  await expect(page.getByRole('heading', { name: '申請已成功送出' })).toBeVisible()
  await expect(page.getByText('等待指導老師簽核')).toBeVisible()
  expect(requests.ruleRequests).toBe(1)
  expect(requests.advisorRequests).toBe(1)
  expect(submittedBody).toContain('"studentNumber":"4A0X0001"')
  expect(submittedBody).toContain('"email":"student@example.com"')
  expect(submittedBody).toContain('"requestedPoints":"20.00"')
  expect(submittedBody).toContain('"requestedPoints":"40.00"')
  expect(submittedBody).toContain('attachments[')
})

test('retries an uncertain submission with the same Idempotency-Key', async ({
  page,
}) => {
  await mockQueries(page)
  const idempotencyKeys: string[] = []
  let attempts = 0
  await page.route('**/public/applications', async (route) => {
    attempts += 1
    idempotencyKeys.push(
      (await route.request().allHeaders())['idempotency-key'] ?? '',
    )
    if (attempts === 1) {
      await route.fulfill({ status: 503, json: { code: 'temporary_failure' } })
      return
    }
    await route.fulfill({ status: 201, json: success })
  })

  await page.goto('/apply/competition')
  await completeCommonFirstStep(page)
  await completeDetails(page, 'finalist')
  await expect(page.getByLabel('申請點數')).toBeDisabled()
  await expect(page.getByLabel('申請點數')).toHaveValue('3.00')
  await completeAdvisorAndAttachment(page)
  await page.getByRole('button', { name: '確認送出申請' }).click()
  await expect(page.getByRole('heading', { name: '無法確認是否送件成功' })).toBeVisible()
  await page.getByRole('button', { name: '重新確認送件' }).click()

  await expect(page.getByRole('heading', { name: '申請已成功送出' })).toBeVisible()
  expect(idempotencyKeys).toHaveLength(2)
  expect(idempotencyKeys[0]).toMatch(/^[0-9a-f-]{36}$/)
  expect(idempotencyKeys[1]).toBe(idempotencyKeys[0])
})

test('keeps the five-step form usable at 360px without horizontal overflow', async ({
  page,
}) => {
  await mockQueries(page)
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/apply/competition')

  await expect(page.getByRole('heading', { name: '學生與參與者資料' })).toBeVisible()
  const nextButton = page.getByRole('button', { name: '下一步' })
  const box = await nextButton.boundingBox()
  expect(box?.height).toBeGreaterThanOrEqual(44)
  expect(box?.width).toBeGreaterThanOrEqual(44)
  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth)
})
