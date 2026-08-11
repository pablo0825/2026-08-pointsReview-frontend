import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return '找不到你要查看的頁面。'
    }

    return '頁面暫時無法載入，請稍後再試。'
  }

  return '系統發生未預期的錯誤，請稍後再試。'
}

export function RouteErrorPage() {
  const error = useRouteError()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-slate-600">載入失敗</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          無法顯示這個頁面
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600" role="alert">
          {getErrorMessage(error)}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            onClick={() => window.location.reload()}
            type="button"
          >
            重新載入
          </button>
          <Link
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-800 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            to="/apply"
          >
            返回申請入口
          </Link>
        </div>
      </section>
    </main>
  )
}
