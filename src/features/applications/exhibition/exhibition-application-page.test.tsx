import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'

import { AppProviders } from '../../../app/providers/app-providers'
import { appRoutes } from '../../../app/router/router'
import { publicAdvisors } from '../../../test/fixtures/competition-application'
import { server } from '../../../test/server'
import { exhibitionApplicationSuccess } from '../../../test/fixtures/exhibition-application'

const pointOptions = [
  {
    exhibitionType: 'fan_work',
    allowedPointsPerPerson: ['1.00', '2.50'],
  },
  {
    exhibitionType: 'project_work',
    allowedPointsPerPerson: ['3.00', '5.00'],
  },
] as const

function renderPage() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/apply/exhibition'],
  })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

function useSuccessfulQueries(onRulesRequest?: () => void) {
  server.use(
    http.get('*/public/exhibition-point-options', ({ request }) => {
      onRulesRequest?.()
      expect(new URL(request.url).search).toBe('')
      return HttpResponse.json({ data: pointOptions })
    }),
    http.get('*/public/advisors', () =>
      HttpResponse.json({ data: publicAdvisors }),
    ),
  )
}

async function completeParticipants(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: '參與者資料' })
  fireEvent.change(screen.getByLabelText('姓名'), {
    target: { value: '測試學生' },
  })
  fireEvent.change(screen.getByLabelText('學號'), {
    target: { value: '4a0x0001' },
  })
  fireEvent.blur(screen.getByLabelText('學號'))
  await user.type(screen.getByLabelText('申請人 Email'), 'student@example.com')
  await user.type(screen.getByLabelText('申請人電話'), '0912-345-678')
  await user.click(screen.getByRole('button', { name: '下一步' }))
  await screen.findByRole('heading', { name: '展覽內容與點數' })
}

async function completeDetails(user: ReturnType<typeof userEvent.setup>) {
  await completeParticipants(user)
  await user.selectOptions(screen.getByLabelText('展覽類型'), 'project_work')
  await user.type(screen.getByLabelText('作品名稱'), ' 測試作品 ')
  await user.selectOptions(screen.getByLabelText('展覽名稱'), 'other')
  await user.type(screen.getByLabelText('其他展覽名稱'), ' 測試展 ')
  await user.type(screen.getByLabelText('主辦單位'), ' 測試單位 ')
  await user.type(screen.getByLabelText('展覽場地'), ' 測試場地 ')
  fireEvent.change(screen.getByLabelText('開始日期'), { target: { value: '2026-07-01' } })
  fireEvent.change(screen.getByLabelText('結束日期'), { target: { value: '2026-07-05' } })
  await user.selectOptions(screen.getByLabelText('參與者 1 申請點數'), '3.00')
  await user.click(screen.getByRole('button', { name: '下一步' }))
  await user.click(await screen.findByRole('radio', { name: /測試老師/ }))
  await user.click(screen.getByRole('button', { name: '下一步' }))
  const photo = new File(['photo'], 'exhibition.png', { type: 'image/png' })
  await user.upload(screen.getByLabelText('新增附件'), photo)
  await user.click(screen.getByRole('button', { name: '下一步' }))
  await screen.findByRole('heading', { name: '確認送出' })
}

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:preview'),
  })
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  })
})

describe('exhibition application page', () => {
  it('loads rules without query parameters and starts with profile-only participant editing', async () => {
    let ruleRequests = 0
    useSuccessfulQueries(() => {
      ruleRequests += 1
    })
    const user = userEvent.setup()

    renderPage()

    await screen.findByRole('heading', { name: '參與者資料' })
    expect(screen.queryByLabelText('申請點數')).not.toBeInTheDocument()
    expect(screen.queryByText(/學年度/)).not.toBeInTheDocument()
    expect(screen.getByLabelText('申請人 Email')).toBeInTheDocument()

    await completeParticipants(user)
    await user.click(screen.getByRole('button', { name: '上一步' }))
    await user.click(screen.getByRole('button', { name: '下一步' }))

    expect(ruleRequests).toBe(1)
  })

  it('shows only API exhibition types and discrete point choices', async () => {
    useSuccessfulQueries()
    const user = userEvent.setup()
    renderPage()

    await completeParticipants(user)

    const typeSelect = screen.getByLabelText('展覽類型')
    expect(within(typeSelect).getAllByRole('option').map(({ textContent }) => textContent)).toEqual([
      '請選擇展覽類型',
      '同人作品',
      '專題作品',
    ])
    await user.selectOptions(typeSelect, 'fan_work')
    const points = screen.getByLabelText('參與者 1 申請點數')
    expect(within(points).getAllByRole('option').map(({ textContent }) => textContent)).toEqual([
      '請選擇點數',
      '1.00 點',
      '2.50 點',
    ])
  })

  it('keeps participants but clears every selected point after a confirmed type change', async () => {
    useSuccessfulQueries()
    const confirm = vi.spyOn(window, 'confirm')
    const user = userEvent.setup()
    renderPage()
    await completeParticipants(user)

    await user.selectOptions(screen.getByLabelText('展覽類型'), 'fan_work')
    await user.selectOptions(screen.getByLabelText('參與者 1 申請點數'), '2.50')

    confirm.mockReturnValueOnce(false)
    await user.selectOptions(screen.getByLabelText('展覽類型'), 'project_work')
    expect(screen.getByLabelText('展覽類型')).toHaveValue('fan_work')
    expect(screen.getByLabelText('參與者 1 申請點數')).toHaveValue('2.50')

    confirm.mockReturnValueOnce(true)
    await user.selectOptions(screen.getByLabelText('展覽類型'), 'project_work')
    expect(screen.getByLabelText('展覽類型')).toHaveValue('project_work')
    expect(screen.getByLabelText('參與者 1 申請點數')).toHaveValue('')
    expect(screen.getByRole('heading', { name: /測試學生/ })).toBeInTheDocument()
    expect(screen.getByText(/4A0X0001/)).toBeInTheDocument()
    await waitFor(() => expect(confirm).toHaveBeenCalledTimes(2))
    confirm.mockRestore()
  })

  it('blocks the workflow when no effective point rules exist and allows reloading', async () => {
    let requests = 0
    server.use(http.get('*/public/exhibition-point-options', () => {
      requests += 1
      return HttpResponse.json({ data: [] })
    }))
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('heading', { name: '目前沒有可申請的展覽點數規則' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '重新載入' }))
    await waitFor(() => expect(requests).toBe(2))
  })

  it('shows a retryable blocking state when point rules fail to load', async () => {
    let requests = 0
    server.use(http.get('*/public/exhibition-point-options', () => {
      requests += 1
      if (requests === 1) return HttpResponse.json({}, { status: 503 })
      return HttpResponse.json({ data: pointOptions })
    }))
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('heading', { name: '暫時無法載入展覽點數規則' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '重新載入' }))
    expect(await screen.findByRole('heading', { name: '參與者資料' })).toBeInTheDocument()
    expect(requests).toBe(2)
  })

  it('submits the canonical multipart payload and renders the success contract', async () => {
    useSuccessfulQueries()
    let payload: Record<string, unknown> | undefined
    let idempotencyKey: string | null = null
    let credentials: RequestCredentials | undefined
    server.use(http.post('*/public/applications', async ({ request }) => {
      credentials = request.credentials
      idempotencyKey = request.headers.get('Idempotency-Key')
      const formData = await request.formData()
      payload = JSON.parse(String(formData.get('payload')))
      return HttpResponse.json(exhibitionApplicationSuccess, { status: 201 })
    }))
    const user = userEvent.setup()
    renderPage()

    await completeDetails(user)
    expect(screen.queryByText(/學年度/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '參與者與點數' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '展覽資料' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '指導老師' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '附件' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(await screen.findByRole('heading', { name: '申請已成功送出' })).toBeInTheDocument()
    expect(credentials).toBe('omit')
    expect(idempotencyKey).toMatch(/^[0-9a-f-]{36}$/)
    expect(payload).toMatchObject({
      applicationType: 'exhibition',
      advisorId: 10,
      applicant: { name: '測試學生', email: 'student@example.com' },
      participants: [{ academicYear: '115', studentNumber: '4A0X0001', requestedPoints: '3.00', isApplicant: true }],
      attachments: [{ attachmentType: 'exhibition_photo' }],
      typeDetails: {
        exhibitionType: 'project_work',
        workName: '測試作品',
        exhibitionName: 'other',
        exhibitionNameOther: '測試展',
        organizer: '測試單位',
        venue: '測試場地',
      },
    })
  })

  it('retries an uncertain submission with the exact same idempotency key and snapshot', async () => {
    useSuccessfulQueries()
    const keys: (string | null)[] = []
    const payloads: string[] = []
    let requestCount = 0
    server.use(http.post('*/public/applications', async ({ request }) => {
      requestCount += 1
      keys.push(request.headers.get('Idempotency-Key'))
      const formData = await request.formData()
      payloads.push(String(formData.get('payload')))
      if (requestCount === 1) return HttpResponse.json({ message: 'temporary' }, { status: 503 })
      return HttpResponse.json(exhibitionApplicationSuccess, { status: 201 })
    }))
    const user = userEvent.setup()
    renderPage()
    await completeDetails(user)

    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    expect(await screen.findByRole('heading', { name: '無法確認是否送件成功' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '確認送出申請' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '上一步' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4. 附件' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '重新確認送件' }))

    expect(await screen.findByRole('heading', { name: '申請已成功送出' })).toBeInTheDocument()
    expect(keys[0]).toBe(keys[1])
    expect(payloads[0]).toBe(payloads[1])
  })

  it('routes stale point validation back to step two and clears points after reloading rules', async () => {
    useSuccessfulQueries()
    let ruleRequests = 0
    server.use(
      http.get('*/public/exhibition-point-options', () => {
        ruleRequests += 1
        if (ruleRequests === 2) return HttpResponse.json({}, { status: 503 })
        return HttpResponse.json({ data: pointOptions })
      }),
      http.post('*/public/applications', () => HttpResponse.json({
        code: 'validation_failed',
        message: '規則已更新',
        fields: [{ path: 'participants.0.requestedPoints', message: '點數已失效' }],
      }, { status: 422 })),
    )
    const user = userEvent.setup()
    renderPage()
    await completeDetails(user)

    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(await screen.findByRole('heading', { name: '展覽內容與點數' })).toBeInTheDocument()
    expect(screen.getByText('點數已失效')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新載入規則' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: '重新載入規則' }))
    expect(await screen.findByText('仍無法載入最新展覽點數規則，請稍後再試。')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('combobox', { name: /參與者 1 申請點數/ })).toHaveValue('3.00'))
    expect(screen.getByRole('button', { name: '下一步' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '重新載入規則' }))
    expect(screen.getByRole('combobox', { name: /參與者 1 申請點數/ })).toHaveValue('')
    expect(screen.getByRole('heading', { name: /測試學生/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '下一步' })).toBeEnabled()
  })

  it('does not invalidate point rules for an ordinary exhibition field error', async () => {
    useSuccessfulQueries()
    server.use(http.post('*/public/applications', () => HttpResponse.json({
      code: 'validation_failed',
      fields: [
        { path: 'unexpected.server.path', message: '有一個欄位目前無法定位' },
        { path: 'typeDetails.workName', message: '作品名稱不可使用' },
      ],
    }, { status: 422 })))
    const user = userEvent.setup()
    renderPage()
    await completeDetails(user)

    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(await screen.findByRole('heading', { name: '展覽內容與點數' })).toBeInTheDocument()
    expect(screen.getByText('作品名稱不可使用')).toBeInTheDocument()
    expect(screen.getByText('有一個欄位目前無法定位')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '重新載入規則' })).not.toBeInTheDocument()
    expect(screen.getByLabelText('參與者 1 申請點數')).toHaveValue('3.00')
  })

  it('routes reversed multi-step errors to the earliest step and preserves later attachment errors', async () => {
    useSuccessfulQueries()
    server.use(http.post('*/public/applications', async ({ request }) => {
      const formData = await request.formData()
      const payload = JSON.parse(String(formData.get('payload'))) as {
        attachments: { clientFileKey: string }[]
      }
      return HttpResponse.json({
        code: 'validation_failed',
        fields: [
          { path: `attachments.${payload.attachments[0].clientFileKey}.description`, message: '附件說明需要調整' },
          { path: 'applicant.name', message: '申請人姓名需要調整' },
        ],
      }, { status: 422 })
    }))
    const user = userEvent.setup()
    renderPage()
    await completeDetails(user)

    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    expect(await screen.findByRole('heading', { name: '參與者資料' })).toBeInTheDocument()
    expect(screen.getByText('申請人姓名需要調整')).toBeInTheDocument()

    await user.type(screen.getByLabelText('姓名'), '改')
    await user.click(screen.getByRole('button', { name: '下一步' }))
    await user.click(screen.getByRole('button', { name: '下一步' }))
    await user.click(screen.getByRole('button', { name: '下一步' }))

    expect(await screen.findByRole('heading', { name: '附件' })).toBeInTheDocument()
    expect(screen.getByText('附件說明需要調整')).toBeInTheDocument()
    expect(screen.getByLabelText('說明（選填）')).toHaveAttribute('aria-invalid', 'true')
  })

  it.each([
    {
      name: '附件限制',
      response: { code: 'file_too_large', message: 'too large' },
      status: 400,
      heading: '附件',
      message: '每個附件不得超過 5 MB。',
    },
    {
      name: '送件識別衝突',
      response: { code: 'idempotency_key_conflict', message: '送件識別衝突' },
      status: 409,
      heading: '確認送出',
      message: '送件識別衝突',
    },
    {
      name: '未知用戶端錯誤',
      response: { code: 'forbidden', message: '目前無法接受這份申請' },
      status: 403,
      heading: '確認送出',
      message: '目前無法接受這份申請',
    },
  ])('keeps $name as a safe page state', async ({ response, status, heading, message }) => {
    useSuccessfulQueries()
    server.use(http.post('*/public/applications', () =>
      HttpResponse.json(response, { status }),
    ))
    const user = userEvent.setup()
    renderPage()
    await completeDetails(user)

    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(message)
    expect(screen.queryByRole('heading', { name: '無法確認是否送件成功' })).not.toBeInTheDocument()
  })

  it('honors Retry-After after a rate-limited submission', async () => {
    useSuccessfulQueries()
    server.use(http.post('*/public/applications', () =>
      HttpResponse.json(
        { code: 'rate_limited', message: '嘗試次數過多' },
        { status: 429, headers: { 'Retry-After': '5' } },
      ),
    ))
    const user = userEvent.setup()
    renderPage()
    await completeDetails(user)

    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(await screen.findByRole('heading', { name: '確認送出' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/請等待 [1-5] 秒後再試/)
    expect(screen.getByRole('button', { name: '確認送出申請' })).toBeDisabled()
  })
})
