const express = require('express')
const cors = require('cors')
const { createProxyMiddleware } = require('http-proxy-middleware')

const app = express()
const PORT = 3000

// Basic CORS setup
app.use(cors())

// Proxy configuration
const proxyOptions = {
  target: 'https://www.charliehr.com',
  changeOrigin: true,
  secure: false,
  pathRewrite: {
    '^/api': '/api/v1'
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward the authorization header from the request
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization)
    }
  }
}

// Apply proxy to all /api routes
app.use('/api', createProxyMiddleware(proxyOptions))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`)
})
