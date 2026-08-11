import {
  createBrowserRouter,
  redirect,
  type RouteObject,
} from 'react-router-dom'

import { RouteErrorPage } from '../error-boundaries/route-error-page'
import { PublicLayout } from '../layouts/public-layout'
import { ApplicationEntryPage } from '../../features/applications/entry/application-entry-page'
import { PublishedInstructionsPage } from '../../features/rules/published-instructions-page'

function createRoutePlaceholder(title: string) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>
    </section>
  )
}

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        loader: () => redirect('/apply'),
      },
      {
        path: 'apply',
        element: <ApplicationEntryPage />,
      },
      {
        path: 'apply/competition',
        element: createRoutePlaceholder('競賽申請表單準備中'),
      },
      {
        path: 'apply/project-participation',
        element: createRoutePlaceholder('參與計畫申請表單準備中'),
      },
      {
        path: 'apply/certificate',
        element: createRoutePlaceholder('證照申請表單準備中'),
      },
      {
        path: 'apply/exhibition',
        element: createRoutePlaceholder('展覽申請表單準備中'),
      },
      {
        path: 'rules',
        element: <PublishedInstructionsPage />,
      },
    ],
  },
]

export const router = createBrowserRouter(appRoutes)
