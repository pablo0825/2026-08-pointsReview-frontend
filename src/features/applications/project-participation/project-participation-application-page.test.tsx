import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeEach, vi } from 'vitest'

import { AppProviders } from '../../../app/providers/app-providers'
import { appRoutes } from '../../../app/router/router'
import { publicAdvisors } from '../../../test/fixtures/competition-application'
import {
  projectParticipationApplicationSuccess,
  projectPointEstimateSuccess,
} from '../../../test/fixtures/project-participation-application'
import { server } from '../../../test/server'

function renderPage() {
  const router = createMemoryRouter(appRoutes, {
    initialEntries: ['/apply/project-participation'],
  })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  return router
}

async function completeFirstStep(user: ReturnType<typeof userEvent.setup>) {
  await screen.findByRole('heading', { name: '計畫內容與薪資試算' })
  await user.type(screen.getByLabelText('計畫名稱'), '數位學習計畫')
  await user.type(screen.getByLabelText('計畫主持人'), '陳教授')
  await user.type(screen.getByLabelText('工作內容'), '協助教材設計。')
  fireEvent.change(screen.getByLabelText('薪資月份'), {
    target: { value: '2026-06' },
  })
  await user.type(screen.getByLabelText('單月薪資'), '8500')
  await user.click(screen.getByRole('button', { name: '試算點數' }))
  expect(await screen.findByText('預估點數：4.00 點')).toBeInTheDocument()
}

async function completeForm(user: ReturnType<typeof userEvent.setup>) {
  await completeFirstStep(user)
  await user.click(screen.getByRole('button', { name: '下一步' }))

  await user.type(screen.getByLabelText('姓名'), '測試學生')
  await user.type(screen.getByLabelText('學號'), '4a0x0001')
  await user.selectOptions(screen.getByLabelText('年級'), '3')
  await user.type(screen.getByLabelText('Email'), 'STUDENT@EXAMPLE.COM')
  await user.type(screen.getByLabelText('電話'), '0912-345-678')
  await user.click(screen.getByRole('button', { name: '下一步' }))

  await user.click(await screen.findByRole('radio', { name: /測試老師/ }))
  await user.click(screen.getByRole('button', { name: '下一步' }))

  await user.upload(
    screen.getByLabelText('新增附件'),
    new File(['salary'], 'salary.pdf', { type: 'application/pdf' }),
  )
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

describe('project participation application page', () => {
  it('only estimates on explicit action and invalidates the result after salary changes', async () => {
    const user = userEvent.setup()
    let estimateRequests = 0
    server.use(
      http.post('*/public/point-estimates/project-participation', () => {
        estimateRequests += 1
        return HttpResponse.json(projectPointEstimateSuccess)
      }),
    )

    renderPage()
    await screen.findByRole('heading', { name: '計畫內容與薪資試算' })
    expect(estimateRequests).toBe(0)
    await completeFirstStep(user)
    expect(estimateRequests).toBe(1)

    await user.clear(screen.getByLabelText('單月薪資'))
    await user.type(screen.getByLabelText('單月薪資'), '8501')
    expect(screen.queryByText('預估點數：4.00 點')).not.toBeInTheDocument()
    expect(estimateRequests).toBe(1)
    await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(screen.getByText('請先完成目前薪資資料的點數試算。')).toBeInTheDocument()
  })

  it('shows an ineligible estimate as a successful blocking result', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/point-estimates/project-participation', () =>
        HttpResponse.json({
          data: { totalSalary: 800, estimatedPoints: '0.00', isEligible: false },
        }),
      ),
    )

    renderPage()
    await screen.findByRole('heading', { name: '計畫內容與薪資試算' })
    await user.type(screen.getByLabelText('計畫名稱'), '數位學習計畫')
    await user.type(screen.getByLabelText('計畫主持人'), '陳教授')
    await user.type(screen.getByLabelText('工作內容'), '協助教材設計。')
    fireEvent.change(screen.getByLabelText('薪資月份'), { target: { value: '2026-06' } })
    await user.type(screen.getByLabelText('單月薪資'), '800')
    await user.click(screen.getByRole('button', { name: '試算點數' }))

    expect(await screen.findByText('預估點數：0.00 點')).toBeInTheDocument()
    expect(screen.getByText('尚未達最低申請門檻')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '下一步' }))
    expect(screen.getByText('目前試算尚未達申請門檻。')).toBeInTheDocument()
  })

  it('maps estimate validation errors to the indexed salary field', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/point-estimates/project-participation', () =>
        HttpResponse.json(
          {
            code: 'validation_failed',
            message: '試算資料不符合規則。',
            fields: [
              {
                path: 'salaryItems.0.salaryMonth',
                message: '薪資月份不可晚於目前月份。',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    )

    renderPage()
    await screen.findByRole('heading', { name: '計畫內容與薪資試算' })
    fireEvent.change(screen.getByLabelText('薪資月份'), { target: { value: '2026-08' } })
    await user.type(screen.getByLabelText('單月薪資'), '1000')
    await user.click(screen.getByRole('button', { name: '試算點數' }))

    const month = screen.getByLabelText('薪資月份')
    await waitFor(() => expect(month).toHaveFocus())
    expect(month).toHaveAccessibleDescription('薪資月份不可晚於目前月份。')
  })

  it('keeps salary input after a 5xx estimate failure and retries only on demand', async () => {
    const user = userEvent.setup()
    let requests = 0
    server.use(
      http.post('*/public/point-estimates/project-participation', () => {
        requests += 1
        return requests === 1
          ? HttpResponse.json({ code: 'temporary' }, { status: 503 })
          : HttpResponse.json(projectPointEstimateSuccess)
      }),
    )

    renderPage()
    await screen.findByRole('heading', { name: '計畫內容與薪資試算' })
    fireEvent.change(screen.getByLabelText('薪資月份'), { target: { value: '2026-06' } })
    await user.type(screen.getByLabelText('單月薪資'), '8500')
    await user.click(screen.getByRole('button', { name: '試算點數' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('暫時無法試算點數')
    expect(screen.getByLabelText('薪資月份')).toHaveValue('2026-06')
    expect(screen.getByLabelText('單月薪資')).toHaveValue(8500)
    expect(requests).toBe(1)
    await user.click(screen.getByRole('button', { name: '重新試算' }))
    expect(await screen.findByText('預估點數：4.00 點')).toBeInTheDocument()
    expect(requests).toBe(2)
  })

  it('submits one participant with uppercase number and the latest backend points', async () => {
    const user = userEvent.setup()
    let submittedPayload: unknown
    let credentials: RequestCredentials | undefined
    server.use(
      http.get('*/public/advisors', () => HttpResponse.json({ data: publicAdvisors })),
      http.post('*/public/applications', async ({ request }) => {
        credentials = request.credentials
        const formData = await request.formData()
        submittedPayload = JSON.parse(String(formData.get('payload')))
        return HttpResponse.json(projectParticipationApplicationSuccess, { status: 201 })
      }),
    )

    renderPage()
    await completeForm(user)
    expect(screen.queryByText(/學年度/)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '計畫與薪資' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))

    expect(await screen.findByRole('heading', { name: '申請已成功送出' })).toBeInTheDocument()
    expect(credentials).toBe('omit')
    expect(submittedPayload).toMatchObject({
      applicationType: 'project_participation',
      applicant: { email: 'student@example.com' },
      participants: [
        {
          studentNumber: '4A0X0001',
          requestedPoints: '4.00',
          isApplicant: true,
        },
      ],
      typeDetails: {
        salaryItems: [{ salaryMonth: '2026-06-01', salaryAmount: 8_500 }],
      },
      attachments: [{ attachmentType: 'salary_proof' }],
    })
  })

  it('reuses the exact snapshot after an uncertain 5xx result', async () => {
    const user = userEvent.setup()
    const keys: string[] = []
    let requestCount = 0
    server.use(
      http.post('*/public/applications', ({ request }) => {
        keys.push(request.headers.get('idempotency-key') ?? '')
        requestCount += 1
        return requestCount === 1
          ? HttpResponse.json({ code: 'temporary' }, { status: 503 })
          : HttpResponse.json(projectParticipationApplicationSuccess, { status: 201 })
      }),
    )

    renderPage()
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: '確認送出申請' }))
    expect(await screen.findByRole('heading', { name: '無法確認是否送件成功' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '重新確認送件' }))
    await screen.findByRole('heading', { name: '申請已成功送出' })
    expect(keys).toHaveLength(2)
    expect(keys[1]).toBe(keys[0])
  })

  it('returns a formal salary validation error to the estimate step', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/public/applications', () =>
        HttpResponse.json(
          {
            code: 'validation_failed',
            message: '送件資料不符合規則。',
            fields: [
              {
                path: 'typeDetails.salaryItems.0.salaryMonth',
                message: '薪資月份不可晚於送件月份。',
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

    await screen.findByRole('heading', { name: '計畫內容與薪資試算' })
    expect(screen.getByLabelText('薪資月份')).toHaveAccessibleDescription(
      '薪資月份不可晚於送件月份。',
    )
    expect(screen.queryByText('預估點數：4.00 點')).not.toBeInTheDocument()
  })
})
