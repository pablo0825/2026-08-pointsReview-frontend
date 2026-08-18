import { getJson } from '../../../../shared/api/api-client'
import { exhibitionPointOptionsResponseSchema } from './exhibition-application.schema'

export const exhibitionPointOptionsQueryKey = ['exhibition', 'point-options'] as const

export async function fetchExhibitionPointOptions(signal?: AbortSignal) {
  const response = await getJson(
    '/public/exhibition-point-options',
    exhibitionPointOptionsResponseSchema,
    signal,
  )
  return response.data
}
