import { http, HttpResponse } from 'msw'

import {
  projectParticipationApplicationSuccess,
  projectPointEstimateSuccess,
} from '../fixtures/project-participation-application'

export const publicProjectParticipationApplicationHandlers = [
  http.post('*/public/point-estimates/project-participation', () =>
    HttpResponse.json(projectPointEstimateSuccess),
  ),
  http.post('*/public/applications', () =>
    HttpResponse.json(projectParticipationApplicationSuccess, { status: 201 }),
  ),
]
