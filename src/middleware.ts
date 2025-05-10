import { isHostAllowed } from './isHostAllowed'
import type { MiddlewareOptions } from './options'
import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Middleware to validate the host header of incoming requests.
 *
 * If the host header is not in the allowed hosts list, a 403 Forbidden response
 * is sent.
 */
export function hostValidationMiddleware(options: MiddlewareOptions) {
  return async function hostValidationMiddleware(
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void
  ) {
    const hostHeader = req.headers.host
    if (!isHostAllowed(hostHeader, options.allowedHosts)) {
      const hostname = hostHeader?.replace(/:\d+$/, '') ?? ''
      const errorMessage =
        options.generateErrorMessage?.(hostname) ??
        generateDefaultErrorMessage(hostname)

      res.writeHead(403, {
        'Content-Type': options.errorResponseContentType ?? 'text/plain'
      })
      res.end(errorMessage)
      return
    }
    next()
  }
}

function generateDefaultErrorMessage(hostname: string) {
  return `Blocked request. This host (${JSON.stringify(
    hostname
  )}) is not allowed.`
}
