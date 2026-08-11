import { render, screen, waitFor } from '@testing-library/react'
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
      screen.getByRole('heading', { name: '申請入口準備中' }),
    ).toBeInTheDocument()
  })
})
