import { z } from 'zod'

import {
  publicApplicantSchema,
  publicApplicationSuccessResponseSchema,
  publicParticipantSchema,
} from '../../common/api/public-application.schema'

const pointsSchema = z.string().regex(/^\d+\.\d{2}$/)
const salaryMonthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-01$/)

export const salaryItemRequestSchema = z
  .object({
    salaryMonth: salaryMonthSchema,
    salaryAmount: z.number().int().min(1).max(50_000),
  })
  .strict()

export const projectPointEstimateRequestSchema = z
  .object({
    salaryItems: z.array(salaryItemRequestSchema).min(1).max(12),
  })
  .strict()

export const projectPointEstimateResponseSchema = z
  .object({
    data: z
      .object({
        totalSalary: z.number().int().min(0).max(600_000),
        estimatedPoints: pointsSchema,
        isEligible: z.boolean(),
      })
      .strict(),
  })
  .strict()

export const projectAttachmentTypeSchema = z.enum([
  'salary_proof',
  'official_document',
  'other',
])

export const projectParticipationApplicationPayloadSchema = z
  .object({
    applicationType: z.literal('project_participation'),
    advisorId: z.number().int().positive(),
    applicant: publicApplicantSchema,
    participants: z
      .array(publicParticipantSchema)
      .length(1)
      .refine(([participant]) => participant?.isApplicant === true),
    typeDetails: z
      .object({
        projectName: z.string().min(1).max(255),
        principalInvestigator: z.string().min(1).max(100),
        workDescription: z.string().min(1).max(1_000),
        salaryItems: z.array(salaryItemRequestSchema).min(1).max(12),
      })
      .strict(),
    attachments: z
      .array(
        z
          .object({
            clientFileKey: z.string().regex(/^[A-Za-z0-9_-]{1,80}$/),
            attachmentType: projectAttachmentTypeSchema,
            attachmentTypeOther: z.string().max(100).nullable(),
            description: z.string().max(500).nullable(),
          })
          .strict(),
      )
      .max(10),
  })
  .strict()

export const projectParticipationApplicationSuccessResponseSchema =
  publicApplicationSuccessResponseSchema

export type SalaryItemRequest = z.infer<typeof salaryItemRequestSchema>
export type ProjectPointEstimateRequest = z.infer<
  typeof projectPointEstimateRequestSchema
>
export type ProjectPointEstimateResponse = z.infer<
  typeof projectPointEstimateResponseSchema
>
export type ProjectAttachmentType = z.infer<
  typeof projectAttachmentTypeSchema
>
export type ProjectParticipationApplicationPayload = z.infer<
  typeof projectParticipationApplicationPayloadSchema
>
export type ProjectParticipationApplicationSuccessResponse = z.infer<
  typeof projectParticipationApplicationSuccessResponseSchema
>
