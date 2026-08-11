import { NavLink, Outlet, type NavLinkRenderProps } from 'react-router-dom'

function getNavigationLinkClass({ isActive }: NavLinkRenderProps) {
  return [
    'inline-flex min-h-11 items-center rounded-lg border-b-2 px-3 py-2 text-sm font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
    isActive
      ? 'border-slate-950 bg-slate-100 text-slate-950'
      : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  ].join(' ')
}

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
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <span className="text-lg font-bold tracking-tight">點數審核系統</span>
          <nav aria-label="主要導覽" className="sm:ml-auto">
            <ul className="flex flex-wrap items-center gap-1">
              <li>
                <NavLink
                  className={getNavigationLinkClass}
                  end
                  to="/apply"
                >
                  開始申請
                </NavLink>
              </li>
              <li>
                <NavLink
                  className={getNavigationLinkClass}
                  end
                  to="/rules"
                >
                  申請辦法
                </NavLink>
              </li>
            </ul>
          </nav>
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
