import { postPublicMultipart } from '../../../../shared/api/api-client'
import {
  competitionApplicationSuccessResponseSchema,
  type CompetitionApplicationPayload,
  type CompetitionApplicationSuccessResponse,
} from './competition-application.schema'

export type AttachmentFile = {
  clientFileKey: string
  file: File
}

export type CompetitionSubmissionSnapshot = {
  idempotencyKey: string
  payload: CompetitionApplicationPayload
  attachments: readonly AttachmentFile[]
}

export function createCompetitionSubmissionSnapshot(
  payload: CompetitionApplicationPayload,
  attachments: readonly AttachmentFile[],
): CompetitionSubmissionSnapshot {
  return {
    idempotencyKey: crypto.randomUUID(),
    payload: structuredClone(payload),
    attachments: attachments.map(({ clientFileKey, file }) => ({
      clientFileKey,
      file,
    })),
  }
}

export function createCompetitionFormData(
  snapshot: CompetitionSubmissionSnapshot,
) {
  const formData = new FormData()
  formData.set('payload', JSON.stringify(snapshot.payload))

  for (const attachment of snapshot.attachments) {
    formData.set(
      `attachments[${attachment.clientFileKey}]`,
      attachment.file,
      attachment.file.name,
    )
  }

  return formData
}

export function submitCompetitionApplication(
  snapshot: CompetitionSubmissionSnapshot,
  signal?: AbortSignal,
): Promise<CompetitionApplicationSuccessResponse> {
  return postPublicMultipart(
    '/public/applications',
    createCompetitionFormData(snapshot),
    competitionApplicationSuccessResponseSchema,
    { 'Idempotency-Key': snapshot.idempotencyKey },
    signal,
    201,
  )
}
