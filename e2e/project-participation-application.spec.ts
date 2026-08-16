import { expect, test, type Page } from '@playwright/test'

const advisors = [
  {
    id: 10,
    name: '陳老師',
    titleCode: 6,
    department: '多媒體設計系',
    isDirector: false,
  },
]

const estimateSuccess = {
  data: {
    totalSalary: 8_500,
    estimatedPoints: '4.00',
    isEligible: true,
  },
}

const applicationSuccess = {
  data: {
    publicId: 'a418d7e4-5778-4a94-8f19-a8fd84f14ee8',
    status: 'pending_advisor',
    submittedAt: '2026-08-16T02:20:30.000Z',
  },
}

async function mockAdvisors(page: Page) {
  await page.route('**/public/advisors', (route) =>
    route.fulfill({ json: { data: advisors } }),
  )
}

async function fillProjectAndEstimate(page: Page) {
  await page.getByLabel('計畫名稱').fill('教育部數位學習推動計畫')
  await page.getByLabel('計畫主持人').fill('陳教授')
  await page.getByLabel('工作內容').fill('協助教材設計、數位內容製作及系統測試。')
  await page.getByLabel('薪資月份').fill('2026-06')
  await page.getByLabel('單月薪資').fill('8500')
  await page.getByRole('button', { name: '試算點數' }).click()
  await expect(page.getByText('預估點數：4.00 點')).toBeVisible()
}

async function completeApplication(page: Page) {
  await fillProjectAndEstimate(page)
  await page.getByRole('button', { name: '下一步' }).click()

  await page.getByLabel('姓名').fill('王小明')
  await page.getByLabel('學號').fill('4a0x0001')
  await page.getByLabel('年級').selectOption('3')
  await page.getByLabel('Email').fill(' STUDENT@EXAMPLE.COM ')
  await page.getByLabel('電話').fill('0912-345-678')
  await page.getByRole('button', { name: '下一步' }).click()

  await page.getByRole('radio', { name: /陳老師/ }).check()
  await page.getByRole('button', { name: '下一步' }).click()
  await page.getByLabel('新增附件').setInputFiles({
    name: 'salary-proof.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 salary proof'),
  })
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByRole('heading', { name: '確認送出' })).toBeVisible()
}

test('submits a normalized single-participant application after an explicit estimate', async ({
  page,
}) => {
  await mockAdvisors(page)
  let estimateRequests = 0
  let submittedBody = ''
  await page.route('**/public/point-estimates/project-participation', async (route) => {
    estimateRequests += 1
    await route.fulfill({ json: estimateSuccess })
  })
  await page.route('**/public/applications', async (route) => {
    submittedBody = route.request().postData() ?? ''
    await route.fulfill({ status: 201, json: applicationSuccess })
  })

  await page.goto('/apply/project-participation')
  await expect(page.getByRole('heading', { name: '計畫內容與薪資試算' })).toBeVisible()
  expect(estimateRequests).toBe(0)
  await completeApplication(page)
  expect(estimateRequests).toBe(1)
  await expect(page.getByText(/學年度/)).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '計畫與薪資' })).toBeVisible()
  await expect(page.getByText('預估點數：4.00 點')).toBeVisible()
  await page.getByRole('button', { name: '確認送出申請' }).click()

  await expect(page.getByRole('heading', { name: '申請已成功送出' })).toBeVisible()
  await expect(page.getByText('等待指導老師簽核')).toBeVisible()
  expect(submittedBody).toContain('"applicationType":"project_participation"')
  expect(submittedBody).toContain('"studentNumber":"4A0X0001"')
  expect(submittedBody).toContain('"email":"student@example.com"')
  expect(submittedBody).toContain('"requestedPoints":"4.00"')
  expect(submittedBody).toContain('"salaryMonth":"2026-06-01"')
  expect(submittedBody).toContain('"attachmentType":"salary_proof"')
  expect(submittedBody).toContain('attachments[')
})

test('invalidates a prior estimate when salary changes and blocks an ineligible result', async ({
  page,
}) => {
  let requests = 0
  await page.route('**/public/point-estimates/project-participation', async (route) => {
    requests += 1
    await route.fulfill({
      json:
        requests === 1
          ? estimateSuccess
          : {
              data: {
                totalSalary: 800,
                estimatedPoints: '0.00',
                isEligible: false,
              },
            },
    })
  })

  await page.goto('/apply/project-participation')
  await fillProjectAndEstimate(page)
  await page.getByLabel('單月薪資').fill('800')
  await expect(page.getByText('預估點數：4.00 點')).toHaveCount(0)
  expect(requests).toBe(1)
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByText('請先完成目前薪資資料的點數試算。')).toBeVisible()

  await page.getByRole('button', { name: '試算點數' }).click()
  await expect(page.getByText('預估點數：0.00 點')).toBeVisible()
  await expect(page.getByText('尚未達最低申請門檻')).toBeVisible()
  await page.getByRole('button', { name: '下一步' }).click()
  await expect(page.getByText('目前試算尚未達申請門檻。')).toBeVisible()
})

test('retries an uncertain submission with the exact same Idempotency-Key at 360px', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await mockAdvisors(page)
  await page.route('**/public/point-estimates/project-participation', (route) =>
    route.fulfill({ json: estimateSuccess }),
  )
  const keys: string[] = []
  let attempts = 0
  await page.route('**/public/applications', async (route) => {
    attempts += 1
    keys.push((await route.request().allHeaders())['idempotency-key'] ?? '')
    await route.fulfill(
      attempts === 1
        ? { status: 503, json: { code: 'temporary_failure' } }
        : { status: 201, json: applicationSuccess },
    )
  })

  await page.goto('/apply/project-participation')
  await completeApplication(page)
  await page.getByRole('button', { name: '確認送出申請' }).click()
  await expect(page.getByRole('heading', { name: '無法確認是否送件成功' })).toBeVisible()
  await page.getByRole('button', { name: '重新確認送件' }).click()
  await expect(page.getByRole('heading', { name: '申請已成功送出' })).toBeVisible()

  expect(keys).toHaveLength(2)
  expect(keys[0]).toMatch(/^[0-9a-f-]{36}$/)
  expect(keys[1]).toBe(keys[0])
  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth)
})

test('keeps the first step keyboard-operable at 360px and warns before leaving', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/apply/project-participation')

  const next = page.getByRole('button', { name: '下一步' })
  const box = await next.boundingBox()
  expect(box?.height).toBeGreaterThanOrEqual(44)
  expect(box?.width).toBeGreaterThanOrEqual(44)
  await page.getByLabel('計畫名稱').fill('尚未送件計畫')
  await page.getByRole('link', { name: '申請辦法' }).click()
  const stay = page.getByRole('button', { name: '繼續填寫' })
  await expect(stay).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page).toHaveURL(/\/apply\/project-participation$/)

  const widths = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(widths.scrollWidth).toBeLessThanOrEqual(widths.clientWidth)
})
