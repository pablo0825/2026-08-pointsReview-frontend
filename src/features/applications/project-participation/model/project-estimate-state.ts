import type {
  ProjectPointEstimateRequest,
  ProjectPointEstimateResponse,
  SalaryItemRequest,
} from '../api/project-participation.schema'

export type SalaryItemFormValue = {
  salaryMonth: string
  salaryAmount: string
}

export type ProjectEstimateState =
  | { status: 'idle' }
  | { status: 'pending'; fingerprint: string }
  | {
      status: 'success'
      fingerprint: string
      result: ProjectPointEstimateResponse['data']
    }
  | { status: 'error'; fingerprint: string }

export const initialProjectEstimateState: ProjectEstimateState = {
  status: 'idle',
}

export function mapSalaryItemsRequest(
  salaryItems: readonly SalaryItemFormValue[],
): SalaryItemRequest[] {
  return salaryItems.map(({ salaryMonth, salaryAmount }) => ({
    salaryMonth: `${salaryMonth}-01`,
    salaryAmount: Number(salaryAmount),
  }))
}

export function createProjectEstimateRequest(
  salaryItems: readonly SalaryItemFormValue[],
): ProjectPointEstimateRequest {
  return { salaryItems: mapSalaryItemsRequest(salaryItems) }
}

export function projectEstimateFingerprint(
  request: ProjectPointEstimateRequest,
) {
  return JSON.stringify(request.salaryItems)
}

export function isCurrentEligibleEstimate(
  state: ProjectEstimateState,
  salaryItems: readonly SalaryItemFormValue[],
) {
  if (state.status !== 'success' || !state.result.isEligible) return false
  return (
    state.fingerprint ===
    projectEstimateFingerprint(createProjectEstimateRequest(salaryItems))
  )
}
