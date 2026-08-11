import { getJson } from '../../../shared/api/api-client'
import { mapPublishedInstructions } from './published-instructions.mapper'
import {
  type ApplicationType,
  publishedInstructionsResponseSchema,
} from './published-instructions.schema'

export type PublishedInstructionsQueryInput = {
  applicationType: ApplicationType
  academicYear?: string
}

export const publishedInstructionsQueryKey = (
  input: PublishedInstructionsQueryInput,
) =>
  [
    'published-instructions',
    input.applicationType,
    input.academicYear ?? 'all',
  ] as const

export function buildPublishedInstructionsPath(
  input: PublishedInstructionsQueryInput,
) {
  const searchParams = new URLSearchParams({
    applicationType: input.applicationType,
  })

  if (input.academicYear) {
    searchParams.set('academicYear', input.academicYear)
  }

  return `/public/application-instructions?${searchParams.toString()}`
}

export async function fetchPublishedInstructions(
  input: PublishedInstructionsQueryInput,
  signal?: AbortSignal,
) {
  const response = await getJson(
    buildPublishedInstructionsPath(input),
    publishedInstructionsResponseSchema,
    signal,
  )

  return mapPublishedInstructions(response)
}
