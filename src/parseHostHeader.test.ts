import { describe, expect, test } from 'vitest'
import { extractHostNameFromHostHeader } from './parseHostHeader'

describe('extractHostNameFromHostHeader', () => {
  const cases = [
    {
      name: 'hostname without port',
      input: 'example.com',
      expected: { type: 'hostname', value: 'example.com' }
    },
    {
      name: 'hostname with port',
      input: 'example.com:8080',
      expected: { type: 'hostname', value: 'example.com' }
    },
    {
      name: 'IPv4 address without port',
      input: '192.168.1.1',
      expected: { type: 'ipv4' }
    },
    {
      name: 'IPv4 address with port',
      input: '192.168.1.1:3000',
      expected: { type: 'ipv4' }
    },
    {
      name: 'IPv6 address without port',
      input: '[2001:db8::1]',
      expected: { type: 'ipv6' }
    },
    {
      name: 'IPv6 address with port',
      input: '[2001:db8::1]:443',
      expected: { type: 'ipv6' }
    },
    {
      name: 'with trailing space',
      input: 'example.com ',
      expected: { type: 'hostname', value: 'example.com' }
    },
    {
      name: 'with leading space',
      input: ' example.com',
      expected: { type: 'hostname', value: 'example.com' }
    },
    {
      name: 'empty input',
      input: '',
      expected: { type: 'hostname', value: '' }
    },
    { name: 'only opening bracket', input: '[', expected: { type: 'invalid' } },
    {
      name: 'wrapped with brackets but not an IPv6 address',
      input: '[example.com]',
      expected: { type: 'invalid' }
    }
  ]

  for (const { name, input, expected } of cases) {
    test(`should extract host for ${name}`, () => {
      expect(extractHostNameFromHostHeader(input)).toStrictEqual(expected)
    })
  }
})
