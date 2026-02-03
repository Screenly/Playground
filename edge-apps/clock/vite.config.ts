import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import type { Plugin, ViteDevServer } from 'vite'
import YAML from 'yaml'

const libraryRoot = path.resolve(__dirname, '../edge-apps-library')
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

// Plugin to resolve .js imports to .ts files in edge-apps-library
// This is needed because TypeScript uses .js extensions in imports but actual files are .ts
function componentResolvePlugin(): Plugin {
  return {
    name: 'component-resolve',
    enforce: 'pre',
    resolveId(id, importer) {
      // Handle sub-path imports like @screenly/edge-apps/components/app-header/app-header
      if (id.startsWith('@screenly/edge-apps/components/')) {
        const subPath = id.replace('@screenly/edge-apps/components/', '')
        // Try with .ts extension
        const tsPath = path.resolve(libraryRoot, 'src/components', `${subPath}.ts`)
        if (fs.existsSync(tsPath)) {
          return tsPath
        }
        // Try without extension (for imports that specify .js)
        const jsPath = path.resolve(libraryRoot, 'src/components', `${subPath.replace(/\.js$/, '')}.ts`)
        if (fs.existsSync(jsPath)) {
          return jsPath
        }
      }

      // Handle .js imports from edge-apps-library (resolve to .ts)
      // This is needed because TypeScript uses .js extensions in imports
      // but the actual files are .ts
      if (importer && id.endsWith('.js') && !id.startsWith('http')) {
        // Skip node_modules
        if (id.includes('node_modules') || id.startsWith('@')) {
          return null
        }

        // Check if importer is from edge-apps-library
        if (importer.includes('/edge-apps-library/')) {
          const tsPath = id.replace(/\.js$/, '.ts')
          const importerDir = path.dirname(importer)
          const fullPath = path.resolve(importerDir, tsPath)
          if (fs.existsSync(fullPath)) {
            return fullPath
          }
          // Also try with .tsx extension
          const tsxPath = id.replace(/\.js$/, '.tsx')
          const fullTsxPath = path.resolve(importerDir, tsxPath)
          if (fs.existsSync(fullTsxPath)) {
            return fullTsxPath
          }
        }
      }
      return null
    },
  }
}

// Plugin to copy manifest files into the build output directory
function copyScreenlyManifestPlugin(): Plugin {
  return {
    name: 'copy-screenly-manifest',
    closeBundle() {
      const manifestSrc = path.resolve(__dirname, 'screenly.yml')
      const manifestDest = path.resolve(__dirname, 'dist', 'screenly.yml')

      const qcSrc = path.resolve(__dirname, 'screenly_qc.yml')
      const qcDest = path.resolve(__dirname, 'dist', 'screenly_qc.yml')

      if (fs.existsSync(manifestSrc)) {
        fs.copyFileSync(manifestSrc, manifestDest)
      }

      if (fs.existsSync(qcSrc)) {
        fs.copyFileSync(qcSrc, qcDest)
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
          // Try to load mock-data.yml, fallback to generic defaults
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
            // App-specific settings should come from mock-data.yml
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
  base: '',
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      // Order matters: more specific aliases must come first
      '@screenly/edge-apps/components': path.resolve(libraryRoot, 'src/components/index.ts'),
      '@screenly/edge-apps': path.resolve(libraryRoot, 'src/index.ts'),
      '@screenly/edge-apps/styles': stylesPath,
    },
  },
  plugins: [
    componentResolvePlugin(),
    cssAliasPlugin(),
    copyScreenlyManifestPlugin(),
    screenlyMockPlugin(),
  ],
  build: {
    outDir: 'dist',
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

