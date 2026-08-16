import { postPublicJson } from '../../../../shared/api/api-client'
import {
  projectPointEstimateResponseSchema,
  type ProjectPointEstimateRequest,
} from './project-participation.schema'

export function estimateProjectParticipationPoints(
  request: ProjectPointEstimateRequest,
  signal?: AbortSignal,
) {
  return postPublicJson(
    '/public/point-estimates/project-participation',
    request,
    projectPointEstimateResponseSchema,
    signal,
    200,
  )
}
