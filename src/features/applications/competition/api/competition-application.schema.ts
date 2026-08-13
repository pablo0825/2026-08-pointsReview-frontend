import { z } from 'zod'

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

export const publicAdvisorSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    titleCode: z.number().int(),
    department: z.string(),
    isDirector: z.boolean(),
  })
  .strict()

export const publicAdvisorsResponseSchema = z
  .object({ data: z.array(publicAdvisorSchema) })
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
    applicant: z
      .object({
        name: z.string().min(1).max(100),
        email: z.string().email().max(320),
        phone: z.string().min(1).max(30),
      })
      .strict(),
    participants: z.array(
      z
        .object({
          academicYear: z.string().min(1),
          grade: z.number().int().min(1).max(6),
          classNumber: z.number().int().min(1).max(5),
          studentNumber: z.string().min(1).max(50),
          studentName: z.string().min(1).max(100),
          requestedPoints: pointsSchema,
          isApplicant: z.boolean(),
        })
        .strict(),
    ).min(1).max(10),
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

export const competitionApplicationSuccessResponseSchema = z
  .object({
    data: z
      .object({
        publicId: z.string().uuid(),
        status: z.literal('pending_advisor'),
        submittedAt: z.string().datetime({ offset: true }),
      })
      .strict(),
  })
  .strict()

export type CompetitionLevel = z.infer<typeof competitionLevelSchema>
export type Award = z.infer<typeof awardSchema>
export type AllocationMethod = z.infer<typeof allocationMethodSchema>
export type CompetitionPointOption = z.infer<typeof competitionPointOptionSchema>
export type PublicAdvisor = z.infer<typeof publicAdvisorSchema>
export type AttachmentType = z.infer<typeof attachmentTypeSchema>
export type CompetitionApplicationPayload = z.infer<
  typeof competitionApplicationPayloadSchema
>
export type CompetitionApplicationSuccessResponse = z.infer<
  typeof competitionApplicationSuccessResponseSchema
>
