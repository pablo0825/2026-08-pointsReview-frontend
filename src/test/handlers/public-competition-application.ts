import { http, HttpResponse } from 'msw'

import {
  competitionApplicationSuccess,
  competitionPointOptions,
  publicAdvisors,
} from '../fixtures/competition-application'

export const publicCompetitionApplicationHandlers = [
  http.get('*/public/competition-point-options', () =>
    HttpResponse.json({ data: competitionPointOptions }),
  ),
  http.get('*/public/advisors', () =>
    HttpResponse.json({ data: publicAdvisors }),
  ),
  http.post('*/public/applications', () =>
    HttpResponse.json(competitionApplicationSuccess, { status: 201 }),
  ),
]
