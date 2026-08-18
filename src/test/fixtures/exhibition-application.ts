import type { ExhibitionPointOption } from '../../features/applications/exhibition/api/exhibition-application.schema'

export const exhibitionPointOptions = [
  { exhibitionType: 'fan_work', allowedPointsPerPerson: ['1.00', '2.50'] },
  { exhibitionType: 'project_work', allowedPointsPerPerson: ['3.00', '5.00'] },
] as const satisfies readonly ExhibitionPointOption[]

export const exhibitionApplicationSuccess = {
  data: {
    publicId: '550e8400-e29b-41d4-a716-446655440007',
    status: 'pending_advisor',
    submittedAt: '2026-08-18T02:20:30.000Z',
  },
} as const
