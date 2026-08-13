import { z } from 'zod'

const DEFAULT_API_ORIGIN = 'http://localhost'

export type ApiClientErrorCode =
  | 'request_failed'
  | 'unexpected_response'
  | 'invalid_response'

export type ApiFieldError = {
  path: string
  message: string
}

type ApiErrorBody = {
  code?: unknown
  message?: unknown
  fields?: unknown
}

export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode
  readonly status: number | null
  readonly apiCode: string | null
  readonly fields: ApiFieldError[]
  readonly retryAfterSeconds: number | null

  constructor(
    code: ApiClientErrorCode,
    status: number | null = null,
    options?: {
      apiCode?: string | null
      message?: string
      fields?: ApiFieldError[]
      retryAfterSeconds?: number | null
    },
  ) {
    super(options?.message || getSafeErrorMessage(code))
    this.name = 'ApiClientError'
    this.code = code
    this.status = status
    this.apiCode = options?.apiCode ?? null
    this.fields = options?.fields ?? []
    this.retryAfterSeconds = options?.retryAfterSeconds ?? null
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

function normalizeFields(value: unknown): ApiFieldError[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((field) => {
    if (
      typeof field === 'object' &&
      field !== null &&
      typeof Reflect.get(field, 'path') === 'string' &&
      typeof Reflect.get(field, 'message') === 'string'
    ) {
      return [
        {
          path: Reflect.get(field, 'path') as string,
          message: Reflect.get(field, 'message') as string,
        },
      ]
    }
    return []
  })
}

function parseRetryAfter(response: Response) {
  const value = response.headers.get('Retry-After')
  if (!value || !/^\d+$/.test(value)) {
    return null
  }
  const seconds = Number(value)
  return Number.isSafeInteger(seconds) && seconds >= 1 ? seconds : null
}

async function createHttpError(response: Response, exposeMessage = false) {
  let body: ApiErrorBody = {}

  try {
    body = (await response.json()) as ApiErrorBody
  } catch {
    // The safe fallback below intentionally ignores non-JSON error bodies.
  }

  const message =
    exposeMessage && typeof body.message === 'string' && body.message.trim()
      ? body.message.trim()
      : undefined

  return new ApiClientError('request_failed', response.status, {
    apiCode: typeof body.code === 'string' ? body.code : null,
    fields: normalizeFields(body.fields),
    message,
    retryAfterSeconds: parseRetryAfter(response),
  })
}

async function parseJson<T>(response: Response, schema: z.ZodType<T>) {
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

async function executeRequest(
  path: string,
  init: RequestInit,
  signal?: AbortSignal,
) {
  try {
    return await fetch(resolveApiUrl(path), { ...init, signal })
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
}

export async function getJson<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
): Promise<T> {
  const response = await executeRequest(
    path,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    },
    signal,
  )

  if (!response.ok) {
    throw await createHttpError(response)
  }

  return parseJson(response, schema)
}

export async function postPublicMultipart<T>(
  path: string,
  formData: FormData,
  schema: z.ZodType<T>,
  headers: HeadersInit,
  signal?: AbortSignal,
  expectedStatus?: number,
): Promise<T> {
  const response = await executeRequest(
    path,
    {
      method: 'POST',
      credentials: 'omit',
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      body: formData,
    },
    signal,
  )

  if (!response.ok) {
    throw await createHttpError(response, true)
  }

  if (expectedStatus !== undefined && response.status !== expectedStatus) {
    throw new ApiClientError('unexpected_response', response.status)
  }

  return parseJson(response, schema)
}
