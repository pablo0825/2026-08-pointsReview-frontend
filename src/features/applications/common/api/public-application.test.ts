import { http, HttpResponse } from 'msw'

import { server } from '../../../../test/server'
import { fetchPublicAdvisors } from './public-advisors.query'
import {
  createPublicApplicationSubmissionSnapshot,
  submitPublicApplication,
} from './public-application.submit'
import { publicApplicationSuccessResponseSchema } from './public-application.schema'

describe('shared public application API', () => {
  it('loads the strict advisor contract without query parameters', async () => {
    let query = 'unseen'
    server.use(
      http.get('*/public/advisors', ({ request }) => {
        query = new URL(request.url).search
        return HttpResponse.json({
          data: [
            {
              id: 10,
              name: '測試老師',
              titleCode: 6,
              department: '設計學系',
              isDirector: false,
            },
          ],
        })
      }),
    )

    await expect(fetchPublicAdvisors()).resolves.toHaveLength(1)
    expect(query).toBe('')
  })

  it('clones payload metadata and reuses one immutable multipart snapshot', async () => {
    let receivedKey: string | null = null
    let receivedPayload: unknown
    const payload = { applicationType: 'test', nested: { name: 'original' } }
    const file = new File(['proof'], 'proof.pdf', { type: 'application/pdf' })
    const snapshot = createPublicApplicationSubmissionSnapshot(payload, [
      { clientFileKey: 'proof-1', file },
    ])
    payload.nested.name = 'changed'

    server.use(
      http.post('*/public/applications', async ({ request }) => {
        receivedKey = request.headers.get('idempotency-key')
        const formData = await request.formData()
        receivedPayload = JSON.parse(String(formData.get('payload')))
        const uploaded = formData.get('attachments[proof-1]')
        expect(uploaded).not.toBeNull()
        expect(typeof uploaded).not.toBe('string')
        if (uploaded && typeof uploaded !== 'string') {
          expect(uploaded.type).toBe('application/pdf')
        }
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

    await submitPublicApplication(
      snapshot,
      publicApplicationSuccessResponseSchema,
    )
    expect(receivedKey).toBe(snapshot.idempotencyKey)
    expect(receivedPayload).toEqual({
      applicationType: 'test',
      nested: { name: 'original' },
    })
  })
})
