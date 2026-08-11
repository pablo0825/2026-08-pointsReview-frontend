import { http, HttpResponse } from 'msw'

import {
  expiredCompetitionSection,
  publishedInstructionFixtures,
} from '../../../test/fixtures/published-instructions'
import { server } from '../../../test/server'
import { mapPublishedInstructions } from './published-instructions.mapper'
import {
  buildPublishedInstructionsPath,
  fetchPublishedInstructions,
  publishedInstructionsQueryKey,
} from './published-instructions.query'
import {
  applicationTypeSchema,
  publishedInstructionsResponseSchema,
} from './published-instructions.schema'

describe('published instructions contract', () => {
  it('accepts exactly the four public application types', () => {
    for (const applicationType of [
      'competition',
      'project_participation',
      'certificate',
      'exhibition',
    ]) {
      expect(applicationTypeSchema.safeParse(applicationType).success).toBe(true)
    }

    expect(applicationTypeSchema.safeParse('unknown').success).toBe(false)
  })

  it('validates the official array response and rejects management fields', () => {
    expect(
      publishedInstructionsResponseSchema.safeParse({
        data: publishedInstructionFixtures,
      }).success,
    ).toBe(true)

    expect(
      publishedInstructionsResponseSchema.safeParse({
        data: [
          {
            ...publishedInstructionFixtures[0],
            status: 'published',
          },
        ],
      }).success,
    ).toBe(false)
  })

  it('preserves API order and does not filter an expired effectiveTo', () => {
    const response = {
      data: [publishedInstructionFixtures[1], expiredCompetitionSection],
    }

    expect(mapPublishedInstructions(response).map(({ sectionKey }) => sectionKey))
      .toEqual([
        publishedInstructionFixtures[1].sectionKey,
        expiredCompetitionSection.sectionKey,
      ])
  })

  it('builds query parameters and cache keys with optional academicYear', () => {
    expect(
      buildPublishedInstructionsPath({ applicationType: 'competition' }),
    ).toBe('/public/application-instructions?applicationType=competition')
    expect(
      buildPublishedInstructionsPath({
        applicationType: 'competition',
        academicYear: '114',
      }),
    ).toBe(
      '/public/application-instructions?applicationType=competition&academicYear=114',
    )
    expect(
      publishedInstructionsQueryKey({
        applicationType: 'competition',
        academicYear: '114',
      }),
    ).toEqual(['published-instructions', 'competition', '114'])
  })

  it('fetches sections for all years or one selected year', async () => {
    const allYears = await fetchPublishedInstructions({
      applicationType: 'competition',
    })
    const selectedYear = await fetchPublishedInstructions({
      applicationType: 'competition',
      academicYear: '114',
    })

    expect(new Set(allYears.map(({ academicYear }) => academicYear))).toEqual(
      new Set(['115', '114']),
    )
    expect(selectedYear.every(({ academicYear }) => academicYear === '114')).toBe(
      true,
    )
  })

  it('keeps HTTP 200 empty data as an empty result', async () => {
    server.use(
      http.get('*/public/application-instructions', () =>
        HttpResponse.json({ data: [] }),
      ),
    )

    await expect(
      fetchPublishedInstructions({ applicationType: 'certificate' }),
    ).resolves.toEqual([])
  })

  it('normalizes HTTP and contract failures', async () => {
    server.use(
      http.get('*/public/application-instructions', () =>
        HttpResponse.json({ code: 'unavailable' }, { status: 503 }),
      ),
    )

    await expect(
      fetchPublishedInstructions({ applicationType: 'competition' }),
    ).rejects.toMatchObject({
      code: 'request_failed',
      status: 503,
    })

    server.use(
      http.get('*/public/application-instructions', () =>
        HttpResponse.json({ data: [{ title: 'missing fields' }] }),
      ),
    )

    await expect(
      fetchPublishedInstructions({ applicationType: 'competition' }),
    ).rejects.toMatchObject({
      code: 'invalid_response',
      status: 200,
    })
  })
})
