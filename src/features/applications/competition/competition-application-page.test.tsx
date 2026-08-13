import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'

import { AppProviders } from '../../../app/providers/app-providers'
import { appRoutes } from '../../../app/router/router'
import { server } from '../../../test/server'
import {
  competitionApplicationSuccess,
  competitionPointOptions,
  publicAdvisors,
} from '../../../test/fixtures/competition-application'

function renderPage() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/apply/competition'],
  })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

async function completeForm(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: '競賽內容' })
  expect(screen.queryByLabelText('姓名')).not.toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('競賽等級'), 'national_integrated')
  await user.selectOptions(screen.getByLabelText('獎項'), 'finalist')
  await user.type(screen.getByLabelText('競賽名稱'), '測試競賽')
  await user.type(screen.getByLabelText('競賽類別'), '設計組')
  await user.type(screen.getByLabelText('競賽日期'), '2026-08-01')
  await user.click(screen.getByRole('button', { name: '下一步' }))

  await screen.findByRole('heading', { name: '參與者資料' })
  expect(screen.queryByLabelText('申請人 Email')).not.toBeInTheDocument()
  await user.type(screen.getByLabelText('姓名'), '測試學生')
  await user.type(screen.getByLabelText('學號'), '4a0x0001')
  await user.click(screen.getByRole('button', { name: '設為申請人' }))
  expect(screen.getByRole('heading', { name: '申請人聯絡資料' })).toBeInTheDocument()
  await user.type(screen.getByLabelText('申請人 Email'), 'STUDENT@EXAMPLE.COM')
  await user.type(screen.getByLabelText('申請人電話'), '0912-345-678')
  expect(screen.getByLabelText('申請點數')).toHaveValue('3.00')
  expect(screen.getByLabelText('申請點數')).toBeDisabled()
  await user.click(screen.getByRole('button', { name: '下一步' }))

  await user.click(await screen.findByRole('radio', { name: /測試老師/ }))
  await user.click(screen.getByRole('button', { name: '下一步' }))

  const file = new File(['proof'], 'proof.pdf', { type: 'application/pdf' })
  await user.upload(screen.getByLabelText('新增附件'), file)
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

describe('competition application page', () => {
  it('requires an explicit applicant and focuses the first selection button', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByRole('heading', { name: '競賽內容' })
    await user.selectOptions(screen.getByLabelText('競賽等級'), 'national_integrated')
    await user.selectOptions(screen.getByLabelText('獎項'), 'finalist')
    await user.type(screen.getByLabelText('競賽名稱'), '測試競賽')
    await user.type(screen.getByLabelText('競賽類別'), '設計組')
    await user.type(screen.getByLabelText('競賽日期'), '2026-08-01')
    await user.click(screen.getByRole('button', { name: '下一步' }))

    await screen.findByRole('heading', { name: '參與者資料' })
    await user.type(screen.getByLabelText('姓名'), '測試學生')
    await user.type(screen.getByLabelText('學號'), '4A0X0001')
    await user.click(screen.getByRole('button', { name: '下一步' }))

    expect(screen.getAllByText('請先選擇一位參與者作為申請人。')).toHaveLength(2)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: '設為申請人' })).toHaveFocus(),
    )
    await user.click(screen.getByRole('button', { name: '設為申請人' }))
    expect(screen.queryByText('請先選擇一位參與者作為申請人。')).not.toBeInTheDocument()
    expect(screen.getByLabelText('申請人 Email')).toBeInTheDocument()
  })

  it('moves cleared contact fields after confirming a different applicant', async () => {
    const user = userEvent.setup()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderPage()
    await screen.findByRole('heading', { name: '競賽內容' })
    await user.selectOptions(screen.getByLabelText('競賽等級'), 'national_integrated')
    await user.selectOptions(screen.getByLabelText('獎項'), 'finalist')
    await user.type(screen.getByLabelText('競賽名稱'), '測試競賽')
    await user.type(screen.getByLabelText('競賽類別'), '設計組')
    await user.type(screen.getByLabelText('競賽日期'), '2026-08-01')
    await user.click(screen.getByRole('button', { name: '下一步' }))

    await screen.findByRole('heading', { name: '參與者資料' })
    await user.type(screen.getByLabelText('姓名'), '甲同學')
    await user.type(screen.getByLabelText('學號'), 'A001')
    await user.click(screen.getByRole('button', { name: '設為申請人' }))
    await user.type(screen.getByLabelText('申請人 Email'), 'first@example.com')
    await user.type(screen.getByLabelText('申請人電話'), '0912345678')
    await user.click(screen.getByRole('button', { name: '新增參與者' }))

    const secondParticipant = screen.getByRole('group', { name: '參與者 2' })
    await user.click(within(secondParticipant).getByRole('button', { name: '設為申請人' }))

    expect(confirm).toHaveBeenCalledOnce()
    expect(within(secondParticipant).getByRole('heading', { name: '申請人聯絡資料' })).toBeInTheDocument()
    expect(within(secondParticipant).getByLabelText('申請人 Email')).toHaveValue('')
    expect(within(secondParticipant).getByLabelText('申請人電話')).toHaveValue('')
    expect(within(screen.getByRole('group', { name: '參與者 1' })).queryByLabelText('申請人 Email')).not.toBeInTheDocument()
    confirm.mockRestore()
  })

  it('loads rules and advisors once and submits a per-person application', async () => {
    const user = userEvent.setup()
    let ruleRequests = 0
    let advisorRequests = 0
    let submittedPayload: unknown
    let credentials: RequestCredentials | undefined

    server.use(
      http.get('*/public/competition-point-options', () => {
        ruleRequests += 1
        return HttpResponse.json({ data: competitionPointOptions })
      }),
      http.get('*/public/advisors', () => {
        advisorRequests += 1
        return HttpResponse.json({ data: publicAdvisors })
      }),
      http.post('*/public/applications', async ({ request }) => {
        credentials = request.credentials
        const formData = await request.formData()
        submittedPayload = JSON.parse(String(formData.get('payload')))
        return HttpResponse.json(competitionApplicationSuccess, { status: 201 })
      }),
    )

    renderPage()
    await completeForm(user)
    expect(ruleRequests).toBe(1)
    expect(advisorRequests).toBe(1)

    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(
      await screen.findByRole('heading', { name: '申請已成功送出' }),
    ).toBeInTheDocument()
    expect(screen.getByText('等待指導老師簽核')).toBeInTheDocument()
    expect(screen.queryByText(/簽核期限/)).not.toBeInTheDocument()
    expect(credentials).toBe('omit')
    expect(submittedPayload).toMatchObject({
      applicant: { email: 'student@example.com' },
      participants: [{ studentNumber: '4A0X0001', requestedPoints: '3.00', isApplicant: true }],
    })
  })

  it('reuses the exact Idempotency-Key after an uncertain 5xx result', async () => {
    const user = userEvent.setup()
    const keys: string[] = []
    let requestCount = 0
    server.use(
      http.post('*/public/applications', ({ request }) => {
        requestCount += 1
        keys.push(request.headers.get('idempotency-key') ?? '')
        if (requestCount === 1) {
          return HttpResponse.json({ code: 'temporary' }, { status: 503 })
        }
        return HttpResponse.json(competitionApplicationSuccess, { status: 201 })
      }),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    expect(
      await screen.findByRole('heading', { name: '無法確認是否送件成功' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '重新確認送件' }))
    await screen.findByRole('heading', { name: '申請已成功送出' })
    expect(keys).toHaveLength(2)
    expect(keys[1]).toBe(keys[0])
  })

  it('distinguishes rule failure and empty states with manual reload', async () => {
    const user = userEvent.setup()
    let fails = true
    server.use(
      http.get('*/public/competition-point-options', () =>
        fails
          ? HttpResponse.json({ code: 'unavailable' }, { status: 503 })
          : HttpResponse.json({ data: [] }),
      ),
    )

    renderPage()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '暫時無法載入競賽點數規則',
    )
    fails = false
    await user.click(screen.getByRole('button', { name: '重新載入' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '目前沒有可申請的競賽點數規則',
      ),
    )
  })

  it('shows the Retry-After countdown and prevents immediate resubmission', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/applications', () =>
        HttpResponse.json(
          { code: 'rate_limited', message: '嘗試次數過多，請稍後再試。' },
          { status: 429, headers: { 'Retry-After': '30' } },
        ),
      ),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('嘗試次數過多')
    expect(screen.getByRole('status')).toHaveTextContent(/請等待 \d+ 秒後再試/)
    expect(screen.getByRole('button', { name: '確認送出申請' })).toBeDisabled()
  })

  it('maps indexed API errors back to the field and focuses it', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/applications', () =>
        HttpResponse.json(
          {
            code: 'validation_failed',
            message: '輸入資料格式不正確。',
            fields: [
              {
                path: 'participants.0.studentNumber',
                message: '學號資料不正確。',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    await screen.findByRole('heading', { name: '參與者資料' })
    await waitFor(() => expect(screen.getByLabelText('學號')).toHaveFocus())
    expect(screen.getByRole('alert')).toHaveTextContent('學號資料不正確')
  })

  it('reloads an invalidated rule and resets points from the refreshed option', async () => {
    const user = userEvent.setup()
    let ruleRequests = 0
    server.use(
      http.get('*/public/competition-point-options', () => {
        ruleRequests += 1
        return HttpResponse.json({
          data: competitionPointOptions.map((option) =>
            ruleRequests === 1 || option.award !== 'finalist'
              ? option
              : { ...option, points: '5.00' },
          ),
        })
      }),
      http.post('*/public/applications', () =>
        HttpResponse.json(
          {
            code: 'validation_failed',
            message: '送件資料不符合規則。',
            fields: [{ path: 'typeDetails', message: '目前規則已更新。' }],
          },
          { status: 422 },
        ),
      ),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    await screen.findByRole('heading', { name: '競賽內容' })
    await user.click(screen.getByRole('button', { name: '重新載入規則' }))
    await user.click(screen.getByRole('button', { name: '下一步' }))

    await waitFor(() => expect(screen.getByLabelText('申請點數')).toHaveValue('5.00'))
    expect(ruleRequests).toBe(2)
  })

  it('uses a new key after an idempotency conflict', async () => {
    const user = userEvent.setup()
    const keys: string[] = []
    server.use(
      http.post('*/public/applications', ({ request }) => {
        keys.push(request.headers.get('idempotency-key') ?? '')
        return keys.length === 1
          ? HttpResponse.json(
              {
                code: 'idempotency_key_conflict',
                message: '送件識別已用於不同資料。',
              },
              { status: 409 },
            )
          : HttpResponse.json(competitionApplicationSuccess, { status: 201 })
      }),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('送件識別已用於不同資料')
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    await screen.findByRole('heading', { name: '申請已成功送出' })

    expect(keys).toHaveLength(2)
    expect(keys[1]).not.toBe(keys[0])
  })

  it('returns known backend file errors to the attachment step', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/applications', () =>
        HttpResponse.json(
          { code: 'file_type_not_allowed', message: 'internal wording' },
          { status: 400 },
        ),
      ),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    await screen.findByRole('heading', { name: '附件' })
    expect(screen.getByRole('alert')).toHaveTextContent('只接受 PDF、JPEG 或 PNG 檔案')
  })

  it('preserves a safe backend message for an unknown 4xx response', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/applications', () =>
        HttpResponse.json(
          { code: 'application_closed', message: '目前不在申請期間。' },
          { status: 418 },
        ),
      ),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('目前不在申請期間')
    expect(screen.getByRole('heading', { name: '確認送出' })).toBeInTheDocument()
  })

  it('treats a network failure as an uncertain result', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/applications', () => HttpResponse.error()),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    expect(
      await screen.findByRole('heading', { name: '無法確認是否送件成功' }),
    ).toBeInTheDocument()
  })

  it('distinguishes advisor failure and empty states with manual reload', async () => {
    const user = userEvent.setup()
    let fails = true
    server.use(
      http.get('*/public/advisors', () =>
        fails
          ? HttpResponse.json({ code: 'unavailable' }, { status: 503 })
          : HttpResponse.json({ data: [] }),
      ),
    )

    renderPage()
    await screen.findByRole('heading', { name: '競賽內容' })
    await user.selectOptions(screen.getByLabelText('競賽等級'), 'national_integrated')
    await user.selectOptions(screen.getByLabelText('獎項'), 'finalist')
    await user.type(screen.getByLabelText('競賽名稱'), '測試競賽')
    await user.type(screen.getByLabelText('競賽類別'), '設計組')
    await user.type(screen.getByLabelText('競賽日期'), '2026-08-01')
    await user.click(screen.getByRole('button', { name: '下一步' }))
    await screen.findByRole('heading', { name: '參與者資料' })
    await user.type(screen.getByLabelText('姓名'), '測試學生')
    await user.type(screen.getByLabelText('學號'), '4A0X0001')
    await user.click(screen.getByRole('button', { name: '設為申請人' }))
    await user.type(screen.getByLabelText('申請人 Email'), 'student@example.com')
    await user.type(screen.getByLabelText('申請人電話'), '0912345678')
    await user.click(screen.getByRole('button', { name: '下一步' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('暫時無法載入指導老師名單')
    fails = false
    await user.click(screen.getByRole('button', { name: '重新載入' }))
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('目前沒有可選擇的指導老師'),
    )
  })
})
