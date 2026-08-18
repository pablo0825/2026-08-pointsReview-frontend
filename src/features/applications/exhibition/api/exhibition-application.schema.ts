import { z } from 'zod'

import {
  publicApplicantSchema,
  publicApplicationSuccessResponseSchema,
  publicParticipantSchema,
} from '../../common/api/public-application.schema'

const pointsSchema = z.string().regex(/^\d+\.\d{2}$/)
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const exhibitionTypeSchema = z.enum(['fan_work', 'project_work'])
export const exhibitionNameSchema = z.enum([
  'campus_exhibition',
  'young_designers_exhibition',
  'vision_get_wild',
  'young_designers_exhibition_taiwan',
  'a_plus_creative_festival',
  'moe_project_competition',
  'other',
])
export const exhibitionAttachmentTypeSchema = z.enum([
  'exhibition_photo',
  'exhibition_poster',
  'official_document',
  'other',
])

export const exhibitionPointOptionSchema = z
  .object({
    exhibitionType: exhibitionTypeSchema,
    allowedPointsPerPerson: z.array(pointsSchema).min(1),
  })
  .strict()
  .superRefine(({ allowedPointsPerPerson }, context) => {
    const sorted = [...allowedPointsPerPerson].sort((left, right) => Number(left) - Number(right))
    if (new Set(allowedPointsPerPerson).size !== allowedPointsPerPerson.length) {
      context.addIssue({ code: 'custom', path: ['allowedPointsPerPerson'], message: 'Point options must be unique' })
    }
    if (sorted.some((value, index) => value !== allowedPointsPerPerson[index])) {
      context.addIssue({ code: 'custom', path: ['allowedPointsPerPerson'], message: 'Point options must be sorted' })
    }
  })

export const exhibitionPointOptionsResponseSchema = z
  .object({ data: z.array(exhibitionPointOptionSchema) })
  .strict()
  .superRefine(({ data }, context) => {
    if (new Set(data.map(({ exhibitionType }) => exhibitionType)).size !== data.length) {
      context.addIssue({ code: 'custom', path: ['data'], message: 'Exhibition types must be unique' })
    }
  })

const exhibitionAttachmentSchema = z.object({
  clientFileKey: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
  attachmentType: exhibitionAttachmentTypeSchema,
  attachmentTypeOther: z.string().max(100).nullable(),
  description: z.string().max(500).nullable(),
}).strict()

export const exhibitionApplicationPayloadSchema = z.object({
  applicationType: z.literal('exhibition'),
  advisorId: z.number().int().positive(),
  applicant: publicApplicantSchema,
  participants: z.array(publicParticipantSchema).min(1).max(15),
  attachments: z.array(exhibitionAttachmentSchema).max(10),
  typeDetails: z.object({
    exhibitionType: exhibitionTypeSchema,
    workName: z.string().trim().min(1).max(255),
    exhibitionName: exhibitionNameSchema,
    exhibitionNameOther: z.string().trim().min(1).max(255).nullable(),
    organizer: z.string().trim().min(1).max(255),
    venue: z.string().trim().min(1).max(255),
    startDate: dateSchema,
    endDate: dateSchema,
  }).strict(),
}).strict().superRefine((value, context) => {
  if (value.participants.filter(({ isApplicant }) => isApplicant).length !== 1) {
    context.addIssue({ code: 'custom', path: ['participants'], message: 'Exactly one applicant is required' })
  }
  const { exhibitionName, exhibitionNameOther } = value.typeDetails
  if ((exhibitionName === 'other') !== (exhibitionNameOther !== null)) {
    context.addIssue({ code: 'custom', path: ['typeDetails', 'exhibitionNameOther'], message: 'Other exhibition name mismatch' })
  }
  if (!value.attachments.some(({ attachmentType }) => attachmentType === 'exhibition_photo')) {
    context.addIssue({ code: 'custom', path: ['attachments'], message: 'Exhibition photo is required' })
  }
})

export const exhibitionApplicationSuccessResponseSchema = publicApplicationSuccessResponseSchema

export type ExhibitionType = z.infer<typeof exhibitionTypeSchema>
export type ExhibitionName = z.infer<typeof exhibitionNameSchema>
export type ExhibitionAttachmentType = z.infer<typeof exhibitionAttachmentTypeSchema>
export type ExhibitionPointOption = z.infer<typeof exhibitionPointOptionSchema>
export type ExhibitionApplicationPayload = z.infer<typeof exhibitionApplicationPayloadSchema>
export type ExhibitionApplicationSuccessResponse = z.infer<typeof exhibitionApplicationSuccessResponseSchema>
