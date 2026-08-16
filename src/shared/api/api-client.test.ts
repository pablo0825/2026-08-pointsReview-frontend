import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { server } from '../../test/server'
import { getJson, postPublicJson, postPublicMultipart } from './api-client'

const responseSchema = z.object({ data: z.string() }).strict()

describe('getJson', () => {
  it('sends a credentialed GET request and validates the response', async () => {
    let credentials: RequestCredentials | undefined

    server.use(
      http.get('*/public/example', ({ request }) => {
        credentials = request.credentials
        return HttpResponse.json({ data: 'ok' })
      }),
    )

    await expect(getJson('/public/example', responseSchema)).resolves.toEqual({
      data: 'ok',
    })
    expect(credentials).toBe('include')
  })

  it('normalizes HTTP errors without exposing the response body', async () => {
    server.use(
      http.get('*/public/example', () =>
        HttpResponse.json(
          { message: 'internal storage key: secret-value' },
          { status: 500 },
        ),
      ),
    )

    const request = getJson('/public/example', responseSchema)

    await expect(request).rejects.toMatchObject({
      code: 'request_failed',
      status: 500,
    })
    await expect(request).rejects.not.toThrow(/secret-value/)
  })

  it('rejects malformed JSON and contract-invalid bodies safely', async () => {
    server.use(
      http.get(
        '*/public/example',
        () => new HttpResponse('{not-json', { status: 200 }),
      ),
    )

    await expect(getJson('/public/example', responseSchema)).rejects.toMatchObject(
      {
        code: 'unexpected_response',
        status: 200,
      },
    )

    server.use(
      http.get('*/public/example', () => HttpResponse.json({ data: 42 })),
    )

    await expect(getJson('/public/example', responseSchema)).rejects.toMatchObject(
      {
        code: 'invalid_response',
        status: 200,
      },
    )
  })

  it('passes through AbortSignal cancellation', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(
      getJson('/public/example', responseSchema, controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('posts public multipart without credentials or a manual content type', async () => {
    let credentials: RequestCredentials | undefined
    let contentType: string | null = null
    let idempotencyKey: string | null = null

    server.use(
      http.post('*/public/example', async ({ request }) => {
        credentials = request.credentials
        contentType = request.headers.get('content-type')
        idempotencyKey = request.headers.get('idempotency-key')
        const body = await request.formData()
        expect(body.get('payload')).toBe('{"ok":true}')
        return HttpResponse.json({ data: 'created' }, { status: 201 })
      }),
    )

    const formData = new FormData()
    formData.set('payload', '{"ok":true}')

    await expect(
      postPublicMultipart(
        '/public/example',
        formData,
        responseSchema,
        { 'Idempotency-Key': '550e8400-e29b-41d4-a716-446655440000' },
      ),
    ).resolves.toEqual({ data: 'created' })
    expect(credentials).toBe('omit')
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/)
    expect(idempotencyKey).toBe('550e8400-e29b-41d4-a716-446655440000')
  })

  it('preserves structured API errors and Retry-After safely', async () => {
    server.use(
      http.post('*/public/example', () =>
        HttpResponse.json(
          {
            code: 'rate_limited',
            message: '嘗試次數過多，請稍後再試。',
            fields: [{ path: 'participants.0.studentNumber', message: 'Required' }],
          },
          { status: 429, headers: { 'Retry-After': '42' } },
        ),
      ),
    )

    const request = postPublicMultipart(
      '/public/example',
      new FormData(),
      responseSchema,
      {},
    )

    await expect(request).rejects.toMatchObject({
      status: 429,
      apiCode: 'rate_limited',
      message: '嘗試次數過多，請稍後再試。',
      retryAfterSeconds: 42,
      fields: [
        { path: 'participants.0.studentNumber', message: 'Required' },
      ],
    })
  })

  it('posts public JSON without credentials and validates the response', async () => {
    let credentials: RequestCredentials | undefined
    let contentType: string | null = null
    let receivedBody: unknown

    server.use(
      http.post('*/public/estimate', async ({ request }) => {
        credentials = request.credentials
        contentType = request.headers.get('content-type')
        receivedBody = await request.json()
        return HttpResponse.json({ data: 'estimated' })
      }),
    )

    await expect(
      postPublicJson(
        '/public/estimate',
        { salaryItems: [] },
        responseSchema,
        undefined,
        200,
      ),
    ).resolves.toEqual({ data: 'estimated' })
    expect(credentials).toBe('omit')
    expect(contentType).toBe('application/json')
    expect(receivedBody).toEqual({ salaryItems: [] })
  })

  it('preserves public JSON field errors and rejects an unexpected status', async () => {
    server.use(
      http.post('*/public/estimate', () =>
        HttpResponse.json(
          {
            code: 'validation_failed',
            message: '輸入資料格式不正確。',
            fields: [{ path: 'salaryItems.0.salaryMonth', message: 'Required' }],
          },
          { status: 422 },
        ),
      ),
    )

    await expect(
      postPublicJson('/public/estimate', {}, responseSchema),
    ).rejects.toMatchObject({
      status: 422,
      apiCode: 'validation_failed',
      fields: [{ path: 'salaryItems.0.salaryMonth', message: 'Required' }],
    })

    server.use(
      http.post('*/public/estimate', () =>
        HttpResponse.json({ data: 'estimated' }, { status: 201 }),
      ),
    )
    await expect(
      postPublicJson('/public/estimate', {}, responseSchema, undefined, 200),
    ).rejects.toMatchObject({
      code: 'unexpected_response',
      status: 201,
    })
  })
})
