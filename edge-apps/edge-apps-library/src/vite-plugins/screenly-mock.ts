import fs from 'fs'
import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'
import YAML from 'yaml'

/**
 * Plugin to mock screenly.js in development.
 * Loads mock data from mock-data.yml if available.
 */
export function screenlyMockPlugin(): Plugin {
  return {
    name: 'screenly-mock',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/screenly.js?version=1' || req.url === '/screenly.js') {
          const mockData: any = {
            metadata: {
              coordinates: [37.3861, -122.0839] as [number, number],
              hostname: 'dev-hostname',
              screen_name: 'Development Server',
              hardware: 'x86',
              location: 'Development Environment',
              screenly_version: 'development-server',
              tags: ['Development'],
            },
            settings: {},
            cors_proxy_url: 'http://127.0.0.1:8080',
          }

          const mockDataPath = path.resolve(process.cwd(), 'mock-data.yml')
          if (fs.existsSync(mockDataPath)) {
            try {
              const mockDataFile = fs.readFileSync(mockDataPath, 'utf8')
              const parsed = YAML.parse(mockDataFile)

              if (parsed.metadata) {
                mockData.metadata = {
                  ...mockData.metadata,
                  ...parsed.metadata,
                  coordinates: parsed.metadata.coordinates
                    ? [
                        parseFloat(parsed.metadata.coordinates[0]),
                        parseFloat(parsed.metadata.coordinates[1]),
                      ]
                    : mockData.metadata.coordinates,
                }
              }
              if (parsed.settings) {
                mockData.settings = { ...mockData.settings, ...parsed.settings }
              }
            } catch (error) {
              console.warn('Failed to parse mock-data.yml, using defaults:', error)
            }
          }

          const screenlyJsContent = `
// Generated screenly.js for development mode
window.screenly = {
  signalReadyForRendering: () => {
    console.log('signalReadyForRendering called')
  },
  metadata: ${JSON.stringify(mockData.metadata, null, 2)},
  settings: ${JSON.stringify(mockData.settings, null, 2)},
  cors_proxy_url: ${JSON.stringify(mockData.cors_proxy_url)}
}
`

          res.setHeader('Content-Type', 'application/javascript')
          res.end(screenlyJsContent)
          return
        }
        next()
      })
    },
  }
}
