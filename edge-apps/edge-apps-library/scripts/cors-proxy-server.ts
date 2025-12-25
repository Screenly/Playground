import http from 'http'
import https from 'https'
import { URL } from 'url'

// Listen on a specific host via the HOST environment variable
const host = process.env.HOST || '0.0.0.0'
// Listen on a specific port via the PORT environment variable
const port = process.env.PORT || 8080

// Allow self-signed certificates (like cors-anywhere does)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const server = http.createServer((req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
  )
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Max-Age', '86400')

  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Extract target URL from request path (cors-anywhere format: /https://example.com/path)
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

    // Choose http or https module based on protocol
    const httpModule = parsedUrl.protocol === 'https:' ? https : http

    // Prepare request options
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: parsedUrl.host, // Set correct host header
      },
      // For HTTPS, allow self-signed certificates
      rejectUnauthorized: false,
    }

    // Remove headers that shouldn't be forwarded
    delete options.headers['x-forwarded-for']
    delete options.headers['x-forwarded-proto']
    delete options.headers['x-forwarded-host']

    // Make the proxy request
    const proxyReq = httpModule.request(options, (proxyRes) => {
      // Copy response headers (excluding hop-by-hop headers)
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

      // Set response status and stream the response
      res.writeHead(proxyRes.statusCode)
      proxyRes.pipe(res)
    })

    // Handle proxy request errors
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

    // Handle request timeout
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

    // Pipe request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      req.pipe(proxyReq)
    } else {
      proxyReq.end()
    }
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
})

// Start the server
server.listen(port, host, () => {
  console.log(
    `Running CORS Proxy (Node.js built-ins) on http://${host}:${port}`,
  )
})
