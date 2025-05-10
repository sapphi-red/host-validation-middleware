import net from 'node:net'

type Result =
  | { type: 'invalid' }
  | { type: 'ipv6' }
  | { type: 'ipv4' }
  | { type: 'hostname'; value: string }

/**
 * This function assumes that the input is not malformed.
 * This is because we only care about browser requests.
 * Non-browser clients can send any value they want anyway.
 */
export function extractHostNameFromHostHeader(hostHeader: string): Result {
  // `Host = uri-host [ ":" port ]`
  const trimmedHost = hostHeader.trim()

  // IPv6
  if (trimmedHost[0] === '[') {
    const endIpv6 = trimmedHost.indexOf(']')
    if (endIpv6 < 0) {
      return { type: 'invalid' }
    }
    return net.isIP(trimmedHost.slice(1, endIpv6)) === 6
      ? { type: 'ipv6' }
      : { type: 'invalid' }
  }

  // uri-host does not include ":" unless IPv6 address
  const colonPos = trimmedHost.indexOf(':')
  const hostname =
    colonPos === -1 ? trimmedHost : trimmedHost.slice(0, colonPos)

  if (net.isIP(hostname) === 4) {
    return { type: 'ipv4' }
  }

  return { type: 'hostname', value: hostname }
}
