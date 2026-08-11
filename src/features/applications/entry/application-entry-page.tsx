import { Link } from 'react-router-dom'

import { applicationEntryOptions } from './application-entry.config'

export function ApplicationEntryPage() {
  return (
    <section aria-labelledby="application-entry-heading">
      <h1
        className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl"
        id="application-entry-heading"
      >
        請選擇申請類型
      </h1>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {applicationEntryOptions.map((option) => (
          <li key={option.to}>
            <Link
              className="flex min-h-20 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-5 text-center text-lg font-bold text-slate-950 shadow-sm transition hover:border-slate-500 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-4"
              to={option.to}
            >
              {option.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
