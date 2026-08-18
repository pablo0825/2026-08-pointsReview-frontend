import { expect, test, type Page } from '@playwright/test'

const pointOptions = [
  { exhibitionType: 'fan_work', allowedPointsPerPerson: ['1.00', '2.50'] },
  { exhibitionType: 'project_work', allowedPointsPerPerson: ['3.00', '5.00'] },
]

const advisors = [{
  id: 10,
  name: '陳老師',
  titleCode: 6,
  department: '多媒體設計系',
  isDirector: false,
}]

const success = {
  data: {
    publicId: '550e8400-e29b-41d4-a716-446655440007',
    status: 'pending_advisor',
    submittedAt: '2026-08-18T02:20:30.000Z',
  },
}

async function mockQueries(page: Page) {
  let ruleRequests = 0
  let advisorRequests = 0
  await page.route('**/public/exhibition-point-options', async (route) => {
    ruleRequests += 1
    expect(new URL(route.request().url()).search).toBe('')
    await route.fulfill({ json: { data: pointOptions } })
  })
  await page.route('**/public/advisors', async (route) => {
    advisorRequests += 1
    await route.fulfill({ json: { data: advisors } })
  })
  return {
    get advisorRequests() { return advisorRequests },
    get ruleRequests() { return ruleRequests },
  }
}

async function fillParticipants(page: Page, twoParticipants = false) {
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
  await expect(page.getByRole('heading', { name: '展覽內容與點數' })).toBeVisible()
}

async function fillDetails(
  page: Page,
  type: 'fan_work' | 'project_work',
  name: 'campus_exhibition' | 'other' = 'campus_exhibition',
) {
  await page.getByLabel('展覽類型').selectOption(type)
  await page.getByLabel('作品名稱').fill(' 互動設計作品 ')
  await page.getByLabel('展覽名稱').selectOption(name)
  if (name === 'other') await page.getByLabel('其他展覽名稱').fill(' 自主策展 ')
  await page.getByLabel('主辦單位').fill(' 設計學系 ')
  await page.getByLabel('展覽場地').fill(' 創意展演廳 ')
  await page.getByLabel('開始日期').fill('2026-07-01')
  await page.getByLabel('結束日期').fill('2026-07-05')
}

async function completeAdvisorAndPhoto(page: Page) {
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByRole('radio', { name: /陳老師/ }).check()
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByLabel('新增附件').setInputFiles({
    name: 'exhibition-photo.png',
    mimeType: 'image/png',
    buffer: Buffer.from('test exhibition photo'),
  })
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByRole('heading', { name: '確認送出' })).toBeVisible()
}

test('submits a canonical single-participant fan-work application', async ({ page }) => {
  const requests = await mockQueries(page)
  let submittedBody = ''
  await page.route('**/public/applications', async (route) => {
    submittedBody = route.request().postData() ?? ''
    await route.fulfill({ status: 201, json: success })
  })

  await page.goto('/apply/exhibition')
  await expect(page.getByRole('heading', { name: '參與者資料' })).toBeVisible()
  await expect(page.getByLabel('申請點數')).toHaveCount(0)
  await expect(page.getByText(/學年度/)).toHaveCount(0)
  await fillParticipants(page)
  await fillDetails(page, 'fan_work')
  await page.getByLabel('參與者 1 申請點數').selectOption('2.50')
  await completeAdvisorAndPhoto(page)

  await expect(page.getByRole('heading', { name: '參與者與點數' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '展覽資料' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '指導老師' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '附件' })).toBeVisible()
  await expect(page.getByText(/學年度/)).toHaveCount(0)
  await page.getByRole('button', { name: '確認送出申請' }).click()

  await expect(page.getByRole('heading', { name: '申請已成功送出' })).toBeVisible()
  expect(requests.ruleRequests).toBe(1)
  expect(requests.advisorRequests).toBe(1)
  expect(submittedBody).toContain('"applicationType":"exhibition"')
  expect(submittedBody).toContain('"exhibitionType":"fan_work"')
  expect(submittedBody).toContain('"exhibitionName":"campus_exhibition"')
  expect(submittedBody).toContain('"exhibitionNameOther":null')
  expect(submittedBody).toContain('"academicYear":"115"')
  expect(submittedBody).toContain('"studentNumber":"4A0X0001"')
  expect(submittedBody).toContain('"requestedPoints":"2.50"')
  expect(submittedBody).toContain('"attachmentType":"exhibition_photo"')
  expect(submittedBody).toContain('attachments[')
})

test('keeps two participants and clears all points after a confirmed type change', async ({ page }) => {
  await mockQueries(page)
  let submittedBody = ''
  await page.route('**/public/applications', async (route) => {
    submittedBody = route.request().postData() ?? ''
    await route.fulfill({ status: 201, json: success })
  })
  await page.goto('/apply/exhibition')
  await fillParticipants(page, true)
  await fillDetails(page, 'fan_work', 'other')
  const points = page.getByRole('combobox', { name: /參與者 \d+ 申請點數/ })
  await points.nth(0).selectOption('2.50')
  await points.nth(1).selectOption('1.00')

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.getByLabel('展覽類型').selectOption('project_work')
  await expect(page.getByLabel('展覽類型')).toHaveValue('fan_work')
  await expect(points.nth(0)).toHaveValue('2.50')
  await expect(points.nth(1)).toHaveValue('1.00')

  page.once('dialog', (dialog) => dialog.accept())
  await page.getByLabel('展覽類型').selectOption('project_work')
  await expect(points.nth(0)).toHaveValue('')
  await expect(points.nth(1)).toHaveValue('')
  await expect(page.getByRole('heading', { name: /王小明/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: /陳小華/ })).toBeVisible()
  await points.nth(0).selectOption('3.00')
  await points.nth(1).selectOption('5.00')
  await completeAdvisorAndPhoto(page)
  await page.getByRole('button', { name: '確認送出申請' }).click()

  await expect(page.getByRole('heading', { name: '申請已成功送出' })).toBeVisible()
  expect(submittedBody).toContain('"exhibitionType":"project_work"')
  expect(submittedBody).toContain('"exhibitionName":"other"')
  expect(submittedBody).toContain('"exhibitionNameOther":"自主策展"')
  expect(submittedBody).toContain('"requestedPoints":"3.00"')
  expect(submittedBody).toContain('"requestedPoints":"5.00"')
})

test('retries an uncertain multipart snapshot with the same key at 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await mockQueries(page)
  const keys: string[] = []
  const bodies: string[] = []
  let attempts = 0
  await page.route('**/public/applications', async (route) => {
    attempts += 1
    keys.push((await route.request().allHeaders())['idempotency-key'] ?? '')
    bodies.push(route.request().postData() ?? '')
    await route.fulfill(attempts === 1
      ? { status: 503, json: { code: 'temporary_failure' } }
      : { status: 201, json: success })
  })

  await page.goto('/apply/exhibition')
  await fillParticipants(page)
  await fillDetails(page, 'project_work')
  await page.getByLabel('參與者 1 申請點數').selectOption('3.00')
  await completeAdvisorAndPhoto(page)
  await page.getByRole('button', { name: '確認送出申請' }).click()
  await expect(page.getByRole('heading', { name: '無法確認是否送件成功' })).toBeVisible()
  await expect(page.getByRole('button', { name: '確認送出申請' })).toHaveCount(0)
  await page.getByRole('button', { name: '重新確認送件' }).click()

  await expect(page.getByRole('heading', { name: '申請已成功送出' })).toBeVisible()
  expect(keys).toHaveLength(2)
  expect(keys[0]).toMatch(/^[0-9a-f-]{36}$/)
  expect(keys[1]).toBe(keys[0])
  const normalizeBoundary = (body: string) =>
    body.replace(/------WebKitFormBoundary[A-Za-z0-9]+/g, '--multipart-boundary')
  expect(normalizeBoundary(bodies[1])).toBe(normalizeBoundary(bodies[0]))
  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth)
})
