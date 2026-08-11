import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { appRoutes } from './router'

describe('application router', () => {
  it('redirects the root route to the application entry', async () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/'] })

    render(<RouterProvider router={router} />)

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/apply')
    })
    expect(
      screen.getByRole('heading', { name: '請選擇申請類型' }),
    ).toBeInTheDocument()
  })

  it('provides the shared public navigation', () => {
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/apply'] })

    render(<RouterProvider router={router} />)

    const navigation = screen.getByRole('navigation', { name: '主要導覽' })
    expect(
      within(navigation).getByRole('link', { name: '開始申請' }),
    ).toHaveAttribute('href', '/apply')
    expect(
      within(navigation).getByRole('link', { name: '申請辦法' }),
    ).toHaveAttribute('href', '/rules')
  })

  it('navigates from the shared navigation to the rules boundary', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/apply'] })

    render(<RouterProvider router={router} />)

    await user.click(screen.getByRole('link', { name: '申請辦法' }))

    expect(router.state.location.pathname).toBe('/rules')
    expect(
      screen.getByRole('heading', { name: '申請辦法準備中' }),
    ).toBeInTheDocument()
  })
})
