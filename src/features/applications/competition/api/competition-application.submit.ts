import {
  createPublicApplicationSubmissionSnapshot,
  submitPublicApplication,
  type AttachmentFile,
  type PublicApplicationSubmissionSnapshot,
} from '../../common/api/public-application.submit'
import {
  competitionApplicationSuccessResponseSchema,
  type CompetitionApplicationPayload,
  type CompetitionApplicationSuccessResponse,
} from './competition-application.schema'

export type CompetitionSubmissionSnapshot =
  PublicApplicationSubmissionSnapshot<CompetitionApplicationPayload>

export function createCompetitionSubmissionSnapshot(
  payload: CompetitionApplicationPayload,
  attachments: readonly AttachmentFile[],
): CompetitionSubmissionSnapshot {
  return createPublicApplicationSubmissionSnapshot(payload, attachments)
}

export function submitCompetitionApplication(
  snapshot: CompetitionSubmissionSnapshot,
  signal?: AbortSignal,
): Promise<CompetitionApplicationSuccessResponse> {
  return submitPublicApplication(
    snapshot,
    competitionApplicationSuccessResponseSchema,
    signal,
  )
}
