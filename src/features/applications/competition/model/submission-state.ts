import type { CompetitionApplicationSuccessResponse } from '../api/competition-application.schema'
import type { CompetitionSubmissionSnapshot } from '../api/competition-application.submit'

export type SubmissionState =
  | { status: 'idle'; snapshot: null }
  | { status: 'submitting'; snapshot: CompetitionSubmissionSnapshot }
  | { status: 'uncertain'; snapshot: CompetitionSubmissionSnapshot }
  | { status: 'success'; snapshot: null; result: CompetitionApplicationSuccessResponse['data'] }

export const initialSubmissionState: SubmissionState = {
  status: 'idle',
  snapshot: null,
}

export function startSubmission(
  snapshot: CompetitionSubmissionSnapshot,
): SubmissionState {
  return { status: 'submitting', snapshot }
}

export function markSubmissionUncertain(
  snapshot: CompetitionSubmissionSnapshot,
): SubmissionState {
  return { status: 'uncertain', snapshot }
}

export function markSubmissionSuccess(
  result: CompetitionApplicationSuccessResponse['data'],
): SubmissionState {
  return { status: 'success', snapshot: null, result }
}
