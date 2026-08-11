import {
  createBrowserRouter,
  redirect,
  type RouteObject,
} from 'react-router-dom'

import { RouteErrorPage } from '../error-boundaries/route-error-page'
import { PublicLayout } from '../layouts/public-layout'
import { ApplicationEntryPlaceholder } from './application-entry-placeholder'

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
        element: <ApplicationEntryPlaceholder />,
      },
    ],
  },
]

export const router = createBrowserRouter(appRoutes)
