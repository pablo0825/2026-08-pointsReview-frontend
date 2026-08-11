import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import {
  emptyPublicApplicationInstructionsHandler,
  publicApplicationInstructionsUrl,
} from '../../test/handlers/public-application-instructions'
import { server } from '../../test/server'
import { PublishedInstructionsPage } from './published-instructions-page'

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <PublishedInstructionsPage />
    </QueryClientProvider>,
  )
}

describe('PublishedInstructionsPage', () => {
  it('starts unselected with the four fixed controls and sends no request', async () => {
    let requestCount = 0
    server.use(
      http.get(publicApplicationInstructionsUrl, () => {
        requestCount += 1
        return HttpResponse.json({ data: [] })
      }),
    )

    renderPage()

    const group = screen.getByRole('group', { name: '申請類型' })
    expect(
      within(group).getAllByRole('button').map((button) => button.textContent),
    ).toEqual(['競賽申請', '參與計畫申請', '證照申請', '展覽申請'])
    expect(screen.queryByLabelText('學年度')).not.toBeInTheDocument()

    await Promise.resolve()
    expect(requestCount).toBe(0)
  })

  it('loads the current year, preserves section order, and switches years', async () => {
    const user = userEvent.setup()

    renderPage()
    await user.click(screen.getByRole('button', { name: '競賽申請' }))

    expect(
      (await screen.findAllByText('競賽成果申請辦法')).length,
    ).toBeGreaterThan(0)
    const articles = screen
      .getAllByRole('region')
      .filter((article) => article.hasAttribute('aria-labelledby'))
    expect(articles.map((article) => article.getAttribute('aria-labelledby'))).toEqual([
      '競賽成果申請辦法',
      '競賽點數說明',
      '歷史補充說明',
    ])

    await user.selectOptions(screen.getByLabelText('學年度'), '114')
    expect(
      (await screen.findAllByText('114 學年度競賽成果申請辦法')).length,
    ).toBeGreaterThan(0)
  })

  it('treats an HTTP 200 empty array as an empty state', async () => {
    const user = userEvent.setup()
    server.use(emptyPublicApplicationInstructionsHandler())
    renderPage()

    await user.click(screen.getByRole('button', { name: '證照申請' }))

    expect(
      await screen.findByRole('heading', {
        name: '此學年度目前沒有公開辦法',
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows a safe error and retries the failed query', async () => {
    const user = userEvent.setup()
    let shouldFail = true
    server.use(
      http.get(publicApplicationInstructionsUrl, ({ request }) => {
        if (shouldFail) {
          return HttpResponse.json({ code: 'unavailable' }, { status: 503 })
        }

        const academicYear = new URL(request.url).searchParams.get('academicYear')
        return HttpResponse.json({
          data: academicYear
            ? [
                {
                  academicYear: '115',
                  revisionNumber: 1,
                  sectionKey: 'certificate-rules',
                  title: '證照申請辦法',
                  content: '重新載入成功。',
                  displayOrder: 1,
                  effectiveFrom: '2026-08-01',
                  effectiveTo: null,
                },
              ]
            : [],
        })
      }),
    )
    renderPage()

    await user.click(screen.getByRole('button', { name: '證照申請' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '暫時無法載入申請辦法',
    )

    shouldFail = false
    await user.click(screen.getByRole('button', { name: '重新載入' }))
    expect(await screen.findByText('重新載入成功。')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not show a stale result after quickly changing application type', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(publicApplicationInstructionsUrl, async ({ request }) => {
        const url = new URL(request.url)
        const applicationType = url.searchParams.get('applicationType')
        const academicYear = url.searchParams.get('academicYear')

        if (applicationType === 'competition') {
          await delay(100)
        }

        const label =
          applicationType === 'competition' ? '延遲競賽辦法' : '證照申請辦法'
        return HttpResponse.json({
          data: academicYear
            ? [
                {
                  academicYear: '115',
                  revisionNumber: 1,
                  sectionKey: `${applicationType}-rules`,
                  title: label,
                  content: label,
                  displayOrder: 1,
                  effectiveFrom: '2026-08-01',
                  effectiveTo: null,
                },
              ]
            : [],
        })
      }),
    )
    renderPage()

    await user.click(screen.getByRole('button', { name: '競賽申請' }))
    await user.click(screen.getByRole('button', { name: '證照申請' }))

    expect(
      (await screen.findAllByText('證照申請辦法')).length,
    ).toBeGreaterThan(0)
    await waitFor(() => {
      expect(screen.queryByText('延遲競賽辦法')).not.toBeInTheDocument()
    })
  })

  it('renders a section returned after effectiveTo without filtering it', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: '競賽申請' }))

    expect(
      (await screen.findAllByText('歷史補充說明')).length,
    ).toBeGreaterThan(0)
  })

  it('shows loading while a request is pending', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(publicApplicationInstructionsUrl, async () => {
        await delay(100)
        return HttpResponse.json({ data: [] })
      }),
    )
    renderPage()

    await user.click(screen.getByRole('button', { name: '展覽申請' }))

    expect(screen.getByRole('status')).toHaveTextContent('正在載入申請辦法')
  })
})
