import { render, screen } from '@testing-library/react'

import { App } from './app'

describe('App', () => {
  it('renders the public application shell', async () => {
    window.history.pushState({}, '', '/apply')

    render(<App />)

    expect(await screen.findByText('點數審核系統')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: '申請入口準備中' }),
    ).toBeInTheDocument()
  })
})
