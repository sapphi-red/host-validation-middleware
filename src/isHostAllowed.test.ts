import { describe, expect, test } from 'vitest'
import { isHostAllowed } from './isHostAllowed.ts'

describe('isHostAllowed', () => {
  const allowCases = {
    'IP address': [
      '192.168.0.0',
      '[::1]',
      '127.0.0.1:5173',
      '[2001:db8:0:0:1:0:0:1]:5173'
    ],
    localhost: [
      'localhost',
      'localhost:5173',
      'foo.localhost',
      'foo.bar.localhost'
    ],
    specialProtocols: [
      // for electron browser window (https://github.com/webpack/webpack-dev-server/issues/3821)
      'file:///path/to/file.html',
      // for browser extensions (https://github.com/webpack/webpack-dev-server/issues/3807)
      'chrome-extension://foo'
    ],
    others: [undefined]
  }

  const disallowCases = {
    'IP address': ['255.255.255.256', '[:', '[::z]'],
    localhost: ['localhos', 'localhost.foo'],
    specialProtocols: ['mailto:foo@bar.com'],
    others: ['']
  }

  const emptyAllowedHosts: string[] = []
  for (const [name, inputList] of Object.entries(allowCases)) {
    test.each(inputList)(`allows ${name} (%s)`, input => {
      const actual = isHostAllowed(input, emptyAllowedHosts)
      expect(actual).toBe(true)
    })
  }

  for (const [name, inputList] of Object.entries(disallowCases)) {
    test.each(inputList)(`disallows ${name} (%s)`, input => {
      const actual = isHostAllowed(input, emptyAllowedHosts)
      expect(actual).toBe(false)
    })
  }

  test('allows single allowedHosts', () => {
    const cases = {
      allowed: ['example.com'],
      disallowed: ['vite.dev']
    }
    const allowedHosts = ['example.com']
    for (const c of cases.allowed) {
      const actual = isHostAllowed(c, allowedHosts)
      expect(actual, c).toBe(true)
    }
    for (const c of cases.disallowed) {
      const actual = isHostAllowed(c, allowedHosts)
      expect(actual, c).toBe(false)
    }
  })

  test('allows all subdomain allowedHosts', () => {
    const cases = {
      allowed: ['example.com', 'foo.example.com', 'foo.bar.example.com'],
      disallowed: ['vite.dev']
    }
    const allowedHosts = ['.example.com']
    for (const c of cases.allowed) {
      const actual = isHostAllowed(c, allowedHosts)
      expect(actual, c).toBe(true)
    }
    for (const c of cases.disallowed) {
      const actual = isHostAllowed(c, allowedHosts)
      expect(actual, c).toBe(false)
    }
  })

  test('does not cache results if the allowedHosts option is not frozen', () => {
    const allowedHosts = ['foo.example.com']
    const hostHeader = 'foo.example.com'
    const actual1 = isHostAllowed(hostHeader, allowedHosts)
    allowedHosts[0] = 'bar.example.com'
    const actual2 = isHostAllowed(hostHeader, allowedHosts)
    expect(actual1).toBe(true)
    expect(actual2).toBe(false)
  })
})
