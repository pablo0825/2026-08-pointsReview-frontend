import type { z } from 'zod'

import { postPublicMultipart } from '../../../../shared/api/api-client'

export type AttachmentFile = {
  clientFileKey: string
  file: File
}

export type PublicApplicationSubmissionSnapshot<TPayload> = {
  idempotencyKey: string
  payload: TPayload
  attachments: readonly AttachmentFile[]
}

export function createPublicApplicationSubmissionSnapshot<TPayload>(
  payload: TPayload,
  attachments: readonly AttachmentFile[],
): PublicApplicationSubmissionSnapshot<TPayload> {
  return {
    idempotencyKey: crypto.randomUUID(),
    payload: structuredClone(payload),
    attachments: attachments.map(({ clientFileKey, file }) => ({
      clientFileKey,
      file,
    })),
  }
}

export function createPublicApplicationFormData<TPayload>(
  snapshot: PublicApplicationSubmissionSnapshot<TPayload>,
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

export function submitPublicApplication<TPayload, TResponse>(
  snapshot: PublicApplicationSubmissionSnapshot<TPayload>,
  schema: z.ZodType<TResponse>,
  signal?: AbortSignal,
): Promise<TResponse> {
  return postPublicMultipart(
    '/public/applications',
    createPublicApplicationFormData(snapshot),
    schema,
    { 'Idempotency-Key': snapshot.idempotencyKey },
    signal,
    201,
  )
}
