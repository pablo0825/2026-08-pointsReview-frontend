import {
  createPublicApplicationSubmissionSnapshot,
  submitPublicApplication,
  type AttachmentFile,
  type PublicApplicationSubmissionSnapshot,
} from '../../common/api/public-application.submit'
import {
  projectParticipationApplicationSuccessResponseSchema,
  type ProjectParticipationApplicationPayload,
  type ProjectParticipationApplicationSuccessResponse,
} from './project-participation.schema'

export type ProjectParticipationSubmissionSnapshot =
  PublicApplicationSubmissionSnapshot<ProjectParticipationApplicationPayload>

export function createProjectParticipationSubmissionSnapshot(
  payload: ProjectParticipationApplicationPayload,
  attachments: readonly AttachmentFile[],
): ProjectParticipationSubmissionSnapshot {
  return createPublicApplicationSubmissionSnapshot(payload, attachments)
}

export function submitProjectParticipationApplication(
  snapshot: ProjectParticipationSubmissionSnapshot,
  signal?: AbortSignal,
): Promise<ProjectParticipationApplicationSuccessResponse> {
  return submitPublicApplication(
    snapshot,
    projectParticipationApplicationSuccessResponseSchema,
    signal,
  )
}
