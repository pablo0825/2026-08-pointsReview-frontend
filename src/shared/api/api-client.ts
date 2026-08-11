import { z } from 'zod'

const DEFAULT_API_ORIGIN = 'http://localhost'

export type ApiClientErrorCode =
  | 'request_failed'
  | 'unexpected_response'
  | 'invalid_response'

export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode
  readonly status: number | null

  constructor(code: ApiClientErrorCode, status: number | null = null) {
    super(getSafeErrorMessage(code))
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
  }
}

function getSafeErrorMessage(code: ApiClientErrorCode) {
  if (code === 'request_failed') {
    return '資料暫時無法取得，請稍後再試。'
  }

  return '服務回應格式不正確，請稍後再試。'
}

function getApiBaseUrl() {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
  const fallbackOrigin = globalThis.location?.origin ?? DEFAULT_API_ORIGIN

  return configuredBaseUrl || fallbackOrigin
}

function resolveApiUrl(path: string) {
  return new URL(path, getApiBaseUrl()).toString()
}

export async function getJson<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  let response: Response

  try {
    response = await fetch(resolveApiUrl(path), {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
      signal,
    })
  } catch (error) {
    if (signal?.aborted) {
      throw signal.reason instanceof Error
        ? signal.reason
        : new DOMException('Request aborted', 'AbortError')
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    throw new ApiClientError('request_failed')
  }

  if (!response.ok) {
    throw new ApiClientError('request_failed', response.status)
  }

  let body: unknown

  try {
    body = await response.json()
  } catch {
    throw new ApiClientError('unexpected_response', response.status)
  }

  const result = schema.safeParse(body)

  if (!result.success) {
    throw new ApiClientError('invalid_response', response.status)
  }

  return result.data
}
