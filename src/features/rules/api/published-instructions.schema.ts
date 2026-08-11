import { z } from 'zod'

const apiDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const applicationTypeSchema = z.enum([
  'competition',
  'project_participation',
  'certificate',
  'exhibition',
])

export const publishedInstructionSectionSchema = z
  .object({
    academicYear: z.string().min(1),
    revisionNumber: z.number(),
    sectionKey: z.string().min(1),
    title: z.string().min(1),
    content: z.string(),
    displayOrder: z.number(),
    effectiveFrom: apiDateSchema,
    effectiveTo: apiDateSchema.nullable(),
  })
  .strict()

export const publishedInstructionsResponseSchema = z
  .object({
    data: z.array(publishedInstructionSectionSchema),
  })
  .strict()

export type ApplicationType = z.infer<typeof applicationTypeSchema>
export type PublishedInstructionSectionWire = z.infer<
  typeof publishedInstructionSectionSchema
>
export type PublishedInstructionsResponse = z.infer<
  typeof publishedInstructionsResponseSchema
>
