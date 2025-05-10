export type MiddlewareOptions = {
  allowedHosts: readonly string[]
  /**
   * Customize the error message sent when a host is not allowed.
   *
   * @param hostname - The hostname that was not allowed.
   */
  generateErrorMessage?(hostname: string): string
  /**
   * Content-Type for the error response.
   *
   * @default 'text/plain'
   */
  errorResponseContentType?: string
}
