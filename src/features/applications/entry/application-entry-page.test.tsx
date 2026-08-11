import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { ApplicationEntryPage } from './application-entry-page'

const applicationLinks = [
  ['競賽申請', '/apply/competition'],
  ['參與計畫申請', '/apply/project-participation'],
  ['證照申請', '/apply/certificate'],
  ['展覽申請', '/apply/exhibition'],
] as const

function renderPage() {
  return render(
    <MemoryRouter>
      <ApplicationEntryPage />
    </MemoryRouter>,
  )
}

describe('ApplicationEntryPage', () => {
  it('renders exactly four application entry links', () => {
    renderPage()

    expect(
      screen.getByRole('heading', { name: '請選擇申請類型' }),
    ).toBeInTheDocument()

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(applicationLinks.length)

    for (const [label, route] of applicationLinks) {
      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        route,
      )
    }
  })

  it('does not render entry descriptions, participant counts, attachments, or rules links', () => {
    renderPage()

    expect(screen.queryByText(/適用情境/)).not.toBeInTheDocument()
    expect(screen.queryByText(/\d+.*人/)).not.toBeInTheDocument()
    expect(screen.queryByText(/附件/)).not.toBeInTheDocument()
    expect(screen.queryByText('查看申請辦法')).not.toBeInTheDocument()
  })

  it('supports keyboard navigation in the displayed order', async () => {
    const user = userEvent.setup()
    renderPage()

    for (const [label] of applicationLinks) {
      await user.tab()
      expect(screen.getByRole('link', { name: label })).toHaveFocus()
    }
  })
})
