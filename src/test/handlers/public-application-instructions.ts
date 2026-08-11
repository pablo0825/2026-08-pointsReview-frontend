import { http, HttpResponse } from 'msw'

import { applicationTypeSchema } from '../../features/rules/api/published-instructions.schema'
import { publishedInstructionFixtures } from '../fixtures/published-instructions'

export const publicApplicationInstructionsUrl =
  '*/public/application-instructions'

export const publicApplicationInstructionsHandler = http.get(
  publicApplicationInstructionsUrl,
  ({ request }) => {
    const url = new URL(request.url)
    const applicationType = applicationTypeSchema.safeParse(
      url.searchParams.get('applicationType'),
    )

    if (!applicationType.success) {
      return HttpResponse.json(
        { code: 'validation_failed', message: 'applicationType is required' },
        { status: 422 },
      )
    }

    const academicYear = url.searchParams.get('academicYear')
    const data = publishedInstructionFixtures.filter((section) => {
      const matchesType = section.sectionKey.startsWith(
        applicationType.data === 'project_participation'
          ? 'project-participation'
          : applicationType.data,
      )
      const matchesYear = !academicYear || section.academicYear === academicYear

      return matchesType && matchesYear
    })

    return HttpResponse.json({ data })
  },
)

export const publicApplicationInstructionsHandlers = [
  publicApplicationInstructionsHandler,
]

export function emptyPublicApplicationInstructionsHandler() {
  return http.get(publicApplicationInstructionsUrl, () =>
    HttpResponse.json({ data: [] }),
  )
}

export function failedPublicApplicationInstructionsHandler(status = 503) {
  return http.get(publicApplicationInstructionsUrl, () =>
    HttpResponse.json({ code: 'unavailable' }, { status }),
  )
}
