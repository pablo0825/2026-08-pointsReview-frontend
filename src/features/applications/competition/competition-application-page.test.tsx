import { render, screen, waitFor } from '@testing-library/react'
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
  await screen.findByRole('heading', { name: '學生與參與者資料' })
  await user.type(screen.getByLabelText('姓名'), '測試學生')
  await user.type(screen.getByLabelText('學號'), '4a0x0001')
  await user.type(screen.getByLabelText('申請人 Email'), 'STUDENT@EXAMPLE.COM')
  await user.type(screen.getByLabelText('申請人電話'), '0912-345-678')
  await user.click(screen.getByRole('button', { name: '下一步' }))

  await user.selectOptions(screen.getByLabelText('競賽等級'), 'national_integrated')
  await user.selectOptions(screen.getByLabelText('獎項'), 'finalist')
  await user.type(screen.getByLabelText('競賽名稱'), '測試競賽')
  await user.type(screen.getByLabelText('競賽類別'), '設計組')
  await user.type(screen.getByLabelText('競賽日期'), '2026-08-01')
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
      participants: [{ studentNumber: '4A0X0001', requestedPoints: '3.00' }],
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
})
