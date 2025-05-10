# host-validation-middleware

[![npm version](https://badge.fury.io/js/host-validation-middleware.svg)](https://badge.fury.io/js/host-validation-middleware) ![CI](https://github.com/sapphi-red/host-validation-middleware/workflows/CI/badge.svg) [![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

Middleware for validating host headers in requests to protect against [DNS rebinding attacks](https://capec.mitre.org/data/definitions/275.html).

> [!NOTE]
> DNS rebinding attacks are not effective against HTTPS sites. Since HTTPS is now commonly used for production environments, this middleware is generally unnecessary for production sites.

## Install

```shell
npm i -D host-validation-middleware # pnpm add -D host-validation-middleware
```

## Usage

### `hostValidationMiddleware`

This middleware is compatible with [Connect](https://github.com/senchalabs/connect) and frameworks like [Express](https://github.com/expressjs/express) that support Connect-style middleware.

```ts
import connect from 'connect'
import { hostValidationMiddleware } from 'host-validation-middleware'

const app = connect()

app.use(
  hostValidationMiddleware({
    // Values starting with `.` will allow all the subdomains under that domain
    allowedHosts: ['example.com', '.mydomain.com'],
    // Optionally customize the error message:
    generateErrorMessage: hostname => `Access denied for host: ${hostname}`,
    // Optionally set the error response content type:
    errorResponseContentType: 'text/plain'
  })
)

app.use((req, res) => {
  res.end('Hello, world!')
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

### `isHostAllowed`

You can also use the core host validation logic directly:

```ts
import { isHostAllowed } from 'host-validation-middleware'

const allowedHosts = ['example.com', '.mydomain.com']

console.log(isHostAllowed('example.com', allowedHosts)) // true
console.log(isHostAllowed('sub.mydomain.com', allowedHosts)) // true
console.log(isHostAllowed('evil.com', allowedHosts)) // false
```

## Allowed Hosts

The host names listed in the `allowedHosts` options will be allowed.
If the host name starts with a dot, the domain without the dot and any subdomain of it will be allowed.

- Example: With `allowedHosts: ['example.com', '.mydomain.com']`:
  - Requests to `example.com` are allowed.
  - Requests to `mydomain.com`, `foo.mydomain.com`, `bar.foo.mydomain.com` are also allowed.

Also the following hosts that cannot be used for DNS rebinding attacks are always allowed:

- Any `localhost` or subdomain of `localhost` (e.g., `localhost`, `foo.localhost`)
- Any IPv4 or IPv6 address (e.g., `127.0.0.1`, `[::1]`)
- Any host using the `file:` or browser extension protocol

## Credits

The API interface and the original implementation is based on [`webpack-dev-server`](https://github.com/webpack/webpack-dev-server)'s `allowedHosts` option.
