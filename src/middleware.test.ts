import { describe, expect, test, vi } from 'vitest'
import { hostValidationMiddleware } from './middleware.ts'
import httpMocks from 'node-mocks-http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import escapeHtml from 'escape-html'

describe('hostValidationMiddleware', () => {
  test('allow works', () => {
    const middleware = hostValidationMiddleware({ allowedHosts: [] })

    const req = httpMocks.createRequest<IncomingMessage>({
      headers: { host: 'localhost' }
    })
    const res = httpMocks.createResponse<ServerResponse>()
    const next = vi.fn()
    middleware(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('disallow works', () => {
    const middleware = hostValidationMiddleware({ allowedHosts: [] })

    const req = httpMocks.createRequest<IncomingMessage>({
      headers: { host: 'example.com' }
    })
    const res = httpMocks.createResponse<ServerResponse>()
    const next = vi.fn()
    middleware(req, res, next)
    expect(res.statusCode).toBe(403)
    expect(res.getHeader('Content-Type')).toBe('text/plain')
    expect(res._getData()).toContain('Blocked request')
    expect(next).not.toHaveBeenCalled()
  })

  test('error message customization options works', () => {
    const middleware = hostValidationMiddleware({
      allowedHosts: [],
      generateErrorMessage(hostname) {
        return `<p>Custom error message: ${escapeHtml(hostname)}</p>`
      },
      errorResponseContentType: 'text/html'
    })

    const req = httpMocks.createRequest<IncomingMessage>({
      headers: { host: 'example.com:8080' }
    })
    const res = httpMocks.createResponse<ServerResponse>()
    const next = vi.fn()
    middleware(req, res, next)
    expect(res.statusCode).toBe(403)
    expect(res.getHeader('Content-Type')).toBe('text/html')
    expect(res._getData()).toBe('<p>Custom error message: example.com</p>')
    expect(next).not.toHaveBeenCalled()
  })
})
