import { z } from 'zod'

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

export const publicApplicantSchema = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().email().max(320),
    phone: z.string().min(1).max(30),
  })
  .strict()

export const publicParticipantSchema = z
  .object({
    academicYear: z.string().min(1),
    grade: z.number().int().min(1).max(6),
    classNumber: z.number().int().min(1).max(5),
    studentNumber: z.string().min(1).max(50),
    studentName: z.string().min(1).max(100),
    requestedPoints: z.string().regex(/^\d+\.\d{2}$/),
    isApplicant: z.boolean(),
  })
  .strict()

export const publicApplicationSuccessResponseSchema = z
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

export type PublicAdvisor = z.infer<typeof publicAdvisorSchema>
export type PublicApplicationSuccessResponse = z.infer<
  typeof publicApplicationSuccessResponseSchema
>
