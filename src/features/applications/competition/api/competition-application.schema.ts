import { z } from 'zod'

import {
  publicApplicantSchema,
  publicApplicationSuccessResponseSchema,
  publicParticipantSchema,
} from '../../common/api/public-application.schema'
export type { PublicAdvisor } from '../../common/api/public-application.schema'

const pointsSchema = z.string().regex(/^\d+\.\d{2}$/)
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const competitionLevelSchema = z.enum([
  'international_integrated',
  'international_non_integrated',
  'national_integrated',
  'national_non_integrated',
  'other',
])

export const awardSchema = z.enum([
  'participation',
  'finalist',
  'honorable_mention',
  'third_place',
  'second_place',
  'first_place',
])

export const allocationMethodSchema = z.enum(['per_person', 'shared_total'])

export const competitionPointOptionSchema = z
  .object({
    competitionLevel: competitionLevelSchema,
    award: awardSchema,
    allocationMethod: allocationMethodSchema,
    points: pointsSchema,
    minimumPointsPerParticipant: pointsSchema,
    pointIncrement: pointsSchema,
  })
  .strict()

export const competitionPointOptionsResponseSchema = z
  .object({ data: z.array(competitionPointOptionSchema) })
  .strict()

export const attachmentTypeSchema = z.enum([
  'competition_rules',
  'competition_poster',
  'official_website_screenshot',
  'official_document',
  'participation_proof',
  'finalist_or_award_certificate',
  'other',
])

export const competitionApplicationPayloadSchema = z
  .object({
    applicationType: z.literal('competition'),
    advisorId: z.number().int().positive(),
    applicant: publicApplicantSchema,
    participants: z.array(publicParticipantSchema).min(1).max(10),
    typeDetails: z
      .object({
        competitionLevel: competitionLevelSchema,
        competitionLevelOther: z.string().max(100).nullable(),
        award: awardSchema,
        competitionName: z.string().min(1).max(255),
        competitionCategory: z.string().min(1).max(100),
        competitionDate: dateSchema,
      })
      .strict(),
    attachments: z.array(
      z
        .object({
          clientFileKey: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
          attachmentType: attachmentTypeSchema,
          attachmentTypeOther: z.string().max(100).nullable(),
          description: z.string().max(500).nullable(),
        })
        .strict(),
    ).max(10),
  })
  .strict()

export const competitionApplicationSuccessResponseSchema =
  publicApplicationSuccessResponseSchema

export type CompetitionLevel = z.infer<typeof competitionLevelSchema>
export type Award = z.infer<typeof awardSchema>
export type AllocationMethod = z.infer<typeof allocationMethodSchema>
export type CompetitionPointOption = z.infer<typeof competitionPointOptionSchema>
export type AttachmentType = z.infer<typeof attachmentTypeSchema>
export type CompetitionApplicationPayload = z.infer<
  typeof competitionApplicationPayloadSchema
>
export type CompetitionApplicationSuccessResponse = z.infer<
  typeof competitionApplicationSuccessResponseSchema
>
