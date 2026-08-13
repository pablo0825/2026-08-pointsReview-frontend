import { http, HttpResponse } from 'msw'

import { server } from '../../../../test/server'
import {
  competitionApplicationPayloadFixture,
  competitionPointOptions,
} from '../../../../test/fixtures/competition-application'
import {
  fetchCompetitionPointOptions,
  fetchPublicAdvisors,
} from './competition-application.query'
import {
  createCompetitionSubmissionSnapshot,
  submitCompetitionApplication,
} from './competition-application.submit'

describe('competition public API contract', () => {
  it('loads strict point options including pointsIncrement without query params', async () => {
    let query = 'unseen'
    server.use(
      http.get('*/public/competition-point-options', ({ request }) => {
        query = new URL(request.url).search
        return HttpResponse.json({ data: competitionPointOptions })
      }),
    )

    await expect(fetchCompetitionPointOptions()).resolves.toEqual(
      competitionPointOptions,
    )
    expect(query).toBe('')
  })

  it('rejects point options that omit pointsIncrement', async () => {
    server.use(
      http.get('*/public/competition-point-options', () =>
        HttpResponse.json({
          data: [
            {
              ...competitionPointOptions[0],
              pointsIncrement: undefined,
            },
          ],
        }),
      ),
    )

    await expect(fetchCompetitionPointOptions()).rejects.toMatchObject({
      code: 'invalid_response',
    })
  })

  it('loads advisors without query parameters', async () => {
    let query = 'unseen'
    server.use(
      http.get('*/public/advisors', ({ request }) => {
        query = new URL(request.url).search
        return HttpResponse.json({ data: [] })
      }),
    )
    await expect(fetchPublicAdvisors()).resolves.toEqual([])
    expect(query).toBe('')
  })

  it('submits the immutable snapshot with matching multipart keys', async () => {
    let receivedKey: string | null = null
    let receivedPayload: unknown
    let receivedFile: FormDataEntryValue | null = null

    server.use(
      http.post('*/public/applications', async ({ request }) => {
        receivedKey = request.headers.get('idempotency-key')
        const formData = await request.formData()
        receivedPayload = JSON.parse(String(formData.get('payload')))
        receivedFile = formData.get('attachments[attachment-1]')
        return HttpResponse.json(
          {
            data: {
              publicId: '550e8400-e29b-41d4-a716-446655440000',
              status: 'pending_advisor',
              submittedAt: '2026-08-13T02:20:30.000Z',
            },
          },
          { status: 201 },
        )
      }),
    )

    const file = new File(['proof'], 'proof.pdf', {
      type: 'application/pdf',
    })
    const snapshot = createCompetitionSubmissionSnapshot(
      competitionApplicationPayloadFixture,
      [{ clientFileKey: 'attachment-1', file }],
    )

    await submitCompetitionApplication(snapshot)
    expect(snapshot.idempotencyKey).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
    expect(receivedKey).toBe(snapshot.idempotencyKey)
    expect(receivedPayload).toEqual(competitionApplicationPayloadFixture)
    const uploadedFile = receivedFile as Blob | string | null
    expect(uploadedFile).not.toBeNull()
    expect(typeof uploadedFile).not.toBe('string')
    if (uploadedFile && typeof uploadedFile !== 'string') {
      expect(uploadedFile.type).toBe('application/pdf')
      expect(uploadedFile.size).toBeGreaterThan(0)
    }
  })

  it('rejects a schema-valid success body unless the response is 201', async () => {
    server.use(
      http.post('*/public/applications', () =>
        HttpResponse.json({
          data: {
            publicId: '550e8400-e29b-41d4-a716-446655440000',
            status: 'pending_advisor',
            submittedAt: '2026-08-13T02:20:30.000Z',
          },
        }),
      ),
    )
    const snapshot = createCompetitionSubmissionSnapshot(
      competitionApplicationPayloadFixture,
      [],
    )

    await expect(submitCompetitionApplication(snapshot)).rejects.toMatchObject({
      code: 'unexpected_response',
      status: 200,
    })
  })
})
