import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'
import YAML from 'yaml'

const libraryRoot = path.resolve(__dirname, '..')
const stylesPath = path.resolve(libraryRoot, 'src/styles/index.css')

// Plugin to resolve CSS imports with aliases
function cssAliasPlugin(): Plugin {
  return {
    name: 'css-alias-resolver',
    enforce: 'pre',
    resolveId(id, importer) {
      // Only handle CSS imports
      if (id === '@screenly/edge-apps/styles' && importer?.endsWith('.css')) {
        return stylesPath
      }
      return null
    },
  }
}

// Plugin to copy screenly.yml into the build output directory
function copyScreenlyManifestPlugin(): Plugin {
  return {
    name: 'copy-screenly-manifest',
    closeBundle() {
      const src = path.resolve(__dirname, 'screenly.yml')
      const dest = path.resolve(__dirname, 'build', 'screenly.yml')

      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest)
      }
    },
  }
}

// Plugin to mock screenly.js in development
function screenlyMockPlugin(): Plugin {
  return {
    name: 'screenly-mock',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/screenly.js?version=1' || req.url === '/screenly.js') {
          // Try to load mock-data.yml, fallback to defaults
          let mockData: any = {
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

          const mockDataPath = path.resolve(__dirname, 'mock-data.yml')
          if (fs.existsSync(mockDataPath)) {
            try {
              const mockDataFile = fs.readFileSync(mockDataPath, 'utf8')
              const parsed = YAML.parse(mockDataFile)
              
              // Merge mock data with defaults
              if (parsed.metadata) {
                mockData.metadata = {
                  ...mockData.metadata,
                  ...parsed.metadata,
                  // Ensure coordinates are numbers
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

export default defineConfig({
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      '@screenly/edge-apps': path.resolve(libraryRoot, 'src/index.ts'),
      '@screenly/edge-apps/components': path.resolve(libraryRoot, 'src/components/index.ts'),
      // CSS imports need to resolve to actual CSS files, not TypeScript
      '@screenly/edge-apps/styles': stylesPath,
    },
  },
  plugins: [
    cssAliasPlugin(),
    copyScreenlyManifestPlugin(),
    screenlyMockPlugin(),
  ],
  build: {
    outDir: 'build',
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'css/[name][extname]'
          }
          return '[name][extname]'
        },
      },
    },
  },
})

