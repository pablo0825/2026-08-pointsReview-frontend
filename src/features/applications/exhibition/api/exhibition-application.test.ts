import { http, HttpResponse } from 'msw'

import { server } from '../../../../test/server'
import { fetchExhibitionPointOptions } from './exhibition-application.query'
import {
  exhibitionApplicationPayloadSchema,
  exhibitionPointOptionsResponseSchema,
  type ExhibitionApplicationPayload,
} from './exhibition-application.schema'
import {
  createExhibitionSubmissionSnapshot,
  submitExhibitionApplication,
} from './exhibition-application.submit'

const payload: ExhibitionApplicationPayload = {
  applicationType: 'exhibition',
  advisorId: 10,
  applicant: { name: '測試學生', email: 'student@example.com', phone: '0912345678' },
  participants: [{
    academicYear: '115', grade: 3, classNumber: 1, studentNumber: '4A0X0001',
    studentName: '測試學生', requestedPoints: '1.00', isApplicant: true,
  }],
  attachments: [{
    clientFileKey: 'photo-1', attachmentType: 'exhibition_photo',
    attachmentTypeOther: null, description: null,
  }],
  typeDetails: {
    exhibitionType: 'project_work', workName: '作品名稱',
    exhibitionName: 'young_designers_exhibition', exhibitionNameOther: null,
    organizer: '主辦單位', venue: '展覽場地',
    startDate: '2026-07-01', endDate: '2026-07-05',
  },
}

describe('exhibition public API contract', () => {
  it('loads strict sorted point endpoints without query parameters', async () => {
    let query = 'unseen'
    server.use(http.get('*/public/exhibition-point-options', ({ request }) => {
      query = new URL(request.url).search
      return HttpResponse.json({
        data: [{ exhibitionType: 'project_work', allowedPointsPerPerson: ['1.00', '2.00'] }],
      })
    }))

    await expect(fetchExhibitionPointOptions()).resolves.toHaveLength(1)
    expect(query).toBe('')
    expect(exhibitionPointOptionsResponseSchema.safeParse({ data: [] }).success).toBe(true)
  })

  it('rejects duplicate, unsorted, malformed, and unknown point options', () => {
    for (const option of [
      { exhibitionType: 'fan_work', allowedPointsPerPerson: ['1.00', '1.00'] },
      { exhibitionType: 'fan_work', allowedPointsPerPerson: ['1.00', '0.50'] },
      { exhibitionType: 'fan_work', allowedPointsPerPerson: ['1'] },
      { exhibitionType: 'external_exhibition', allowedPointsPerPerson: ['1.00'] },
    ]) {
      expect(exhibitionPointOptionsResponseSchema.safeParse({ data: [option] }).success).toBe(false)
    }
  })

  it('enforces the canonical payload and conditional other name', () => {
    expect(exhibitionApplicationPayloadSchema.safeParse(payload).success).toBe(true)
    expect(exhibitionApplicationPayloadSchema.safeParse({
      ...payload,
      typeDetails: { ...payload.typeDetails, exhibitionNameOther: '' },
    }).success).toBe(false)
    expect(exhibitionApplicationPayloadSchema.safeParse({
      ...payload,
      typeDetails: {
        ...payload.typeDetails,
        exhibitionName: 'other',
        exhibitionNameOther: '自辦成果展',
      },
    }).success).toBe(true)
  })

  it('submits an immutable exhibition multipart snapshot', async () => {
    let receivedPayload: unknown
    server.use(http.post('*/public/applications', async ({ request }) => {
      const formData = await request.formData()
      receivedPayload = JSON.parse(String(formData.get('payload')))
      return HttpResponse.json({ data: {
        publicId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'pending_advisor', submittedAt: '2026-08-18T02:20:30.000Z',
      } }, { status: 201 })
    }))
    const file = new File(['photo'], 'photo.png', { type: 'image/png' })
    const snapshot = createExhibitionSubmissionSnapshot(payload, [
      { clientFileKey: 'photo-1', file },
    ])

    await expect(submitExhibitionApplication(snapshot)).resolves.toMatchObject({
      data: { status: 'pending_advisor' },
    })
    expect(receivedPayload).toEqual(payload)
  })
})
