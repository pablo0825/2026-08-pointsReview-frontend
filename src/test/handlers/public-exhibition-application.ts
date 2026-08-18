import { http, HttpResponse } from 'msw'

import { publicAdvisors } from '../fixtures/competition-application'
import { exhibitionApplicationSuccess, exhibitionPointOptions } from '../fixtures/exhibition-application'

export const publicExhibitionApplicationHandlers = [
  http.get('*/public/exhibition-point-options', () =>
    HttpResponse.json({ data: exhibitionPointOptions }),
  ),
  http.get('*/public/advisors', () =>
    HttpResponse.json({ data: publicAdvisors }),
  ),
  http.post('*/public/applications', () =>
    HttpResponse.json(exhibitionApplicationSuccess, { status: 201 }),
  ),
]
