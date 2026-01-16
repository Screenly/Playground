import http from 'http'
import https from 'https'
import { URL } from 'url'

// Listen on a specific host via the HOST environment variable
const host = process.env.HOST || '0.0.0.0'
// Listen on a specific port via the PORT environment variable
const port = process.env.PORT || 8080

// This script is for development purposes only and should never be deployed to production.
// Disabling TLS certificate validation is a critical security risk.
// Only use this in local development environments.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
  )
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Max-Age', '86400')
}

function makeProxyRequest(
  httpModule: typeof http | typeof https,
  parsedUrl: URL,
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.pathname + parsedUrl.search,
    method: req.method,
    headers: {
      ...req.headers,
      host: parsedUrl.host,
    },
    rejectUnauthorized: false,
  }

  delete options.headers['x-forwarded-for']
  delete options.headers['x-forwarded-proto']
  delete options.headers['x-forwarded-host']

  const proxyReq = httpModule.request(options, (proxyRes) => {
    const excludeHeaders = [
      'connection',
      'keep-alive',
      'proxy-authenticate',
      'proxy-authorization',
      'te',
      'trailers',
      'transfer-encoding',
      'upgrade',
    ]

    Object.keys(proxyRes.headers).forEach((key) => {
      if (!excludeHeaders.includes(key.toLowerCase())) {
        res.setHeader(key, proxyRes.headers[key])
      }
    })

    res.writeHead(proxyRes.statusCode)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error.message)
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          error: 'Proxy error',
          message: error.message,
        }),
      )
    }
  })

  proxyReq.setTimeout(30000, () => {
    proxyReq.destroy()
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json' })
      res.end(
        JSON.stringify({
          error: 'Gateway timeout',
        }),
      )
    }
  })

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq)
  } else {
    proxyReq.end()
  }
}

function handleProxyRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
) {
  setCorsHeaders(res)

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  const urlMatch = req.url.match(/^\/(https?:\/\/.+)$/)

  if (!urlMatch) {
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: 'Invalid request format. Expected: /{protocol}://{host}/{path}',
      }),
    )
    return
  }

  const targetUrl = urlMatch[1]

  try {
    const parsedUrl = new URL(targetUrl)
    console.log(`Proxying ${req.method} request to: ${targetUrl}`)

    const httpModule = parsedUrl.protocol === 'https:' ? https : http
    makeProxyRequest(httpModule, parsedUrl, req, res)
  } catch (error) {
    console.error('Invalid URL:', targetUrl, error.message)
    res.writeHead(400, { 'Content-Type': 'application/json' })
    res.end(
      JSON.stringify({
        error: 'Invalid URL format',
        message: error.message,
      }),
    )
  }
}

const server = http.createServer((req, res) => {
  handleProxyRequest(req, res)
})

// Start the server
server.listen(port, host, () => {
  console.log(
    `Running CORS Proxy (Node.js built-ins) on http://${host}:${port}`,
  )
})
