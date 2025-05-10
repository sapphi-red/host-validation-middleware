import { extractHostNameFromHostHeader } from './parseHostHeader.ts'

const isFileOrExtensionProtocolRE = /^(?:file|.+-extension):/i

// Based on webpack-dev-server's `checkHeader` function: https://github.com/webpack/webpack-dev-server/blob/v5.2.0/lib/Server.js#L3086
// https://github.com/webpack/webpack-dev-server/blob/v5.2.0/LICENSE
function isHostAllowedInternal(
  hostHeader: string,
  allowedHosts: readonly string[]
): boolean {
  if (isFileOrExtensionProtocolRE.test(hostHeader)) {
    return true
  }

  const extracted = extractHostNameFromHostHeader(hostHeader)
  if (extracted.type === 'invalid') {
    return false
  }

  // DNS rebinding attacks does not happen with IP addresses
  if (extracted.type === 'ipv4' || extracted.type === 'ipv6') {
    return true
  }

  const hostname = extracted.value

  // allow localhost and .localhost by default as they always resolve to the loopback address
  // https://datatracker.ietf.org/doc/html/rfc6761#section-6.3
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return true
  }

  for (const allowedHost of allowedHosts) {
    if (allowedHost === hostname) {
      return true
    }

    // allow all subdomains of it
    // e.g. `.foo.example` will allow `foo.example`, `*.foo.example`, `*.*.foo.example`, etc
    if (
      allowedHost[0] === '.' &&
      (allowedHost.slice(1) === hostname || hostname.endsWith(allowedHost))
    ) {
      return true
    }
  }

  return false
}

const cache = new WeakMap<readonly string[], Set<string>>()

/**
 * Check if the host contained in the host header is allowed.
 *
 * This function will cache the result if the `allowedHosts` array is frozen.
 *
 * @param hostHeader - The value of host header. See [RFC 9110 7.2](https://datatracker.ietf.org/doc/html/rfc9110#name-host-and-authority).
 * @param allowedHosts - The allowed host patterns. See the README for more details.
 */
export function isHostAllowed(
  hostHeader: string | undefined,
  allowedHosts: readonly string[]
): boolean {
  if (hostHeader === undefined) {
    return true
  }

  let cachedAllowedHosts: Set<string> | undefined
  if (Object.isFrozen(allowedHosts)) {
    if (!cache.has(allowedHosts)) {
      cache.set(allowedHosts, new Set())
    }

    cachedAllowedHosts = cache.get(allowedHosts)!
    if (cachedAllowedHosts.has(hostHeader)) {
      return true
    }
  }

  const result = isHostAllowedInternal(hostHeader, allowedHosts)
  if (cachedAllowedHosts && result) {
    cachedAllowedHosts.add(hostHeader)
  }
  return result
}
