import { getJson } from '../../../../shared/api/api-client'
import { competitionPointOptionsResponseSchema } from './competition-application.schema'

export const competitionPointOptionsQueryKey = [
  'competition',
  'point-options',
] as const

export async function fetchCompetitionPointOptions(signal?: AbortSignal) {
  const response = await getJson(
    '/public/competition-point-options',
    competitionPointOptionsResponseSchema,
    signal,
  )
  return response.data
}
