import type {
  CompetitionApplicationPayload,
  CompetitionPointOption,
  PublicAdvisor,
} from '../../features/applications/competition/api/competition-application.schema'

export const competitionPointOptions = [
  {
    competitionLevel: 'national_integrated',
    award: 'finalist',
    allocationMethod: 'per_person',
    points: '3.00',
    minimumPointsPerParticipant: '0.50',
    pointIncrement: '0.50',
  },
  {
    competitionLevel: 'national_integrated',
    award: 'first_place',
    allocationMethod: 'shared_total',
    points: '60.00',
    minimumPointsPerParticipant: '0.50',
    pointIncrement: '0.50',
  },
] as const satisfies readonly CompetitionPointOption[]

export const publicAdvisors = [
  {
    id: 10,
    name: '測試老師',
    titleCode: 6,
    department: '設計學系',
    isDirector: false,
  },
] as const satisfies readonly PublicAdvisor[]

export const competitionApplicationPayloadFixture = {
  applicationType: 'competition',
  advisorId: 10,
  applicant: {
    name: '測試學生',
    email: 'student@example.com',
    phone: '0912-345-678',
  },
  participants: [
    {
      academicYear: '115',
      grade: 3,
      classNumber: 1,
      studentNumber: '4A0X0001',
      studentName: '測試學生',
      requestedPoints: '3.00',
      isApplicant: true,
    },
  ],
  typeDetails: {
    competitionLevel: 'national_integrated',
    competitionLevelOther: null,
    award: 'finalist',
    competitionName: '測試競賽',
    competitionCategory: '設計組',
    competitionDate: '2026-08-01',
  },
  attachments: [
    {
      clientFileKey: 'attachment-1',
      attachmentType: 'participation_proof',
      attachmentTypeOther: null,
      description: null,
    },
  ],
} satisfies CompetitionApplicationPayload

export const competitionApplicationSuccess = {
  data: {
    publicId: '550e8400-e29b-41d4-a716-446655440000',
    status: 'pending_advisor',
    submittedAt: '2026-08-13T02:20:30.000Z',
  },
} as const
