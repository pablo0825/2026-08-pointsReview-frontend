import { getJson } from '../../../../shared/api/api-client'
import {
  competitionPointOptionsResponseSchema,
  publicAdvisorsResponseSchema,
} from './competition-application.schema'

export const competitionPointOptionsQueryKey = [
  'competition',
  'point-options',
] as const

export const publicAdvisorsQueryKey = ['public', 'advisors'] as const

export async function fetchCompetitionPointOptions(signal?: AbortSignal) {
  const response = await getJson(
    '/public/competition-point-options',
    competitionPointOptionsResponseSchema,
    signal,
  )
  return response.data
}

export async function fetchPublicAdvisors(signal?: AbortSignal) {
  const response = await getJson(
    '/public/advisors',
    publicAdvisorsResponseSchema,
    signal,
  )
  return response.data
}
