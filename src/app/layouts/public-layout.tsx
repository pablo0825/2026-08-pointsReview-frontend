import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        className="sr-only z-50 rounded-md bg-white px-4 py-2 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main-content"
      >
        跳到主要內容
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center px-4 py-3 sm:px-6 lg:px-8">
          <span className="text-lg font-bold tracking-tight">點數審核系統</span>
        </div>
      </header>
      <main
        className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
        id="main-content"
      >
        <Outlet />
      </main>
    </div>
  )
}
