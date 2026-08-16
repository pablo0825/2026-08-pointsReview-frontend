import { http, HttpResponse } from 'msw'

import { server } from '../../../../test/server'
import { estimateProjectParticipationPoints } from './project-participation.estimate'
import {
  projectParticipationApplicationPayloadSchema,
  projectPointEstimateResponseSchema,
  type ProjectParticipationApplicationPayload,
} from './project-participation.schema'
import {
  createProjectParticipationSubmissionSnapshot,
  submitProjectParticipationApplication,
} from './project-participation.submit'

const payload: ProjectParticipationApplicationPayload = {
  applicationType: 'project_participation',
  advisorId: 10,
  applicant: {
    name: '測試學生',
    email: 'student@example.com',
    phone: '0912345678',
  },
  participants: [
    {
      academicYear: '115',
      grade: 3,
      classNumber: 1,
      studentNumber: '4A0X0001',
      studentName: '測試學生',
      requestedPoints: '4.00',
      isApplicant: true,
    },
  ],
  typeDetails: {
    projectName: '數位學習計畫',
    principalInvestigator: '陳教授',
    workDescription: '協助教材設計。',
    salaryItems: [
      { salaryMonth: '2026-06-01', salaryAmount: 5_000 },
      { salaryMonth: '2026-07-01', salaryAmount: 3_500 },
    ],
  },
  attachments: [
    {
      clientFileKey: 'salary-proof-1',
      attachmentType: 'salary_proof',
      attachmentTypeOther: null,
      description: null,
    },
  ],
}

describe('project participation API contract', () => {
  it('posts the exact salary request and accepts eligible or ineligible results', async () => {
    let receivedBody: unknown
    server.use(
      http.post(
        '*/public/point-estimates/project-participation',
        async ({ request }) => {
          receivedBody = await request.json()
          return HttpResponse.json({
            data: {
              totalSalary: 8_500,
              estimatedPoints: '4.00',
              isEligible: true,
            },
          })
        },
      ),
    )

    await expect(
      estimateProjectParticipationPoints({
        salaryItems: [
          { salaryMonth: '2026-06-01', salaryAmount: 5_000 },
          { salaryMonth: '2026-07-01', salaryAmount: 3_500 },
        ],
      }),
    ).resolves.toEqual({
      data: {
        totalSalary: 8_500,
        estimatedPoints: '4.00',
        isEligible: true,
      },
    })
    expect(receivedBody).toEqual({
      salaryItems: payload.typeDetails.salaryItems,
    })

    expect(
      projectPointEstimateResponseSchema.safeParse({
        data: { totalSalary: 800, estimatedPoints: '0.00', isEligible: false },
      }).success,
    ).toBe(true)
  })

  it('rejects malformed salary and payload wire values', () => {
    expect(
      projectParticipationApplicationPayloadSchema.safeParse({
        ...payload,
        participants: [{ ...payload.participants[0], isApplicant: false }],
      }).success,
    ).toBe(false)
    expect(
      projectParticipationApplicationPayloadSchema.safeParse({
        ...payload,
        typeDetails: {
          ...payload.typeDetails,
          salaryItems: [{ salaryMonth: '2026-06-15', salaryAmount: 5_000 }],
        },
      }).success,
    ).toBe(false)
  })

  it('submits one immutable project application snapshot', async () => {
    let receivedKey: string | null = null
    let receivedPayload: unknown
    const file = new File(['salary'], 'salary.pdf', {
      type: 'application/pdf',
    })
    const snapshot = createProjectParticipationSubmissionSnapshot(payload, [
      { clientFileKey: 'salary-proof-1', file },
    ])

    server.use(
      http.post('*/public/applications', async ({ request }) => {
        receivedKey = request.headers.get('idempotency-key')
        const formData = await request.formData()
        receivedPayload = JSON.parse(String(formData.get('payload')))
        return HttpResponse.json(
          {
            data: {
              publicId: '550e8400-e29b-41d4-a716-446655440000',
              status: 'pending_advisor',
              submittedAt: '2026-08-16T02:20:30.000Z',
            },
          },
          { status: 201 },
        )
      }),
    )

    await expect(submitProjectParticipationApplication(snapshot)).resolves.toMatchObject({
      data: { status: 'pending_advisor' },
    })
    expect(receivedKey).toBe(snapshot.idempotencyKey)
    expect(receivedPayload).toEqual(payload)
  })
})
