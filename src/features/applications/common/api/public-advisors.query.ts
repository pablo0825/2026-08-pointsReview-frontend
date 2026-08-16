import { getJson } from '../../../../shared/api/api-client'
import { publicAdvisorsResponseSchema } from './public-application.schema'

export const publicAdvisorsQueryKey = ['public', 'advisors'] as const

export async function fetchPublicAdvisors(signal?: AbortSignal) {
  const response = await getJson(
    '/public/advisors',
    publicAdvisorsResponseSchema,
    signal,
  )
  return response.data
}
