import {
  createPublicApplicationSubmissionSnapshot,
  submitPublicApplication,
  type AttachmentFile,
  type PublicApplicationSubmissionSnapshot,
} from '../../common/api/public-application.submit'
import {
  exhibitionApplicationSuccessResponseSchema,
  type ExhibitionApplicationPayload,
  type ExhibitionApplicationSuccessResponse,
} from './exhibition-application.schema'

export type ExhibitionSubmissionSnapshot = PublicApplicationSubmissionSnapshot<ExhibitionApplicationPayload>

export function createExhibitionSubmissionSnapshot(
  payload: ExhibitionApplicationPayload,
  attachments: readonly AttachmentFile[],
): ExhibitionSubmissionSnapshot {
  return createPublicApplicationSubmissionSnapshot(payload, attachments)
}

export function submitExhibitionApplication(
  snapshot: ExhibitionSubmissionSnapshot,
  signal?: AbortSignal,
): Promise<ExhibitionApplicationSuccessResponse> {
  return submitPublicApplication(snapshot, exhibitionApplicationSuccessResponseSchema, signal)
}
