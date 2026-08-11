import { http, HttpResponse } from 'msw'
import { z } from 'zod'

import { server } from '../../test/server'
import { getJson } from './api-client'

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
})
