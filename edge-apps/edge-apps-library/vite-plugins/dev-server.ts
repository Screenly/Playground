import type { ViteDevServer, Plugin } from 'vite'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'

type ScreenlyManifestField = {
  type: string
  default_value?: string
  title: string
  optional: boolean
  is_global?: boolean
  help_text: string | Record<string, unknown>
}

type BaseScreenlyMockData = {
  metadata: {
    coordinates: [number, number]
    hostname: string
    screen_name: string
    hardware: string
    location: string
    screenly_version: string
    tags: string[]
  }
  settings: Record<string, string>
  cors_proxy_url: string
}

const defaultScreenlyConfig: BaseScreenlyMockData = {
  metadata: {
    coordinates: [37.3861, -122.0839] as [number, number],
    hostname: 'dev-hostname',
    screen_name: 'Development Server',
    hardware: 'x86',
    location: 'Development Environment',
    screenly_version: 'development-server',
    tags: ['Development'],
  },
  settings: {
    enable_analytics: 'true',
    tag_manager_id: '',
    theme: 'light',
    screenly_color_accent: '#972EFF',
    screenly_color_light: '#ADAFBE',
    screenly_color_dark: '#454BD2',
  },
  cors_proxy_url: 'http://127.0.0.1:8080',
}

function generateScreenlyObject(config: BaseScreenlyMockData) {
  return `
    // Generated screenly.js for development mode
    window.screenly = {
      signalReadyForRendering: () => {},
      metadata: ${JSON.stringify(config.metadata, null, 2)},
      settings: ${JSON.stringify(config.settings, null, 2)},
      cors_proxy_url: ${JSON.stringify(config.cors_proxy_url)}
    }
  `
}

function generateMockData(rootDir: string): BaseScreenlyMockData {
  const manifestPath = path.resolve(rootDir, 'screenly.yml')
  const mockDataPath = path.resolve(rootDir, 'mock-data.yml')

  const manifest = YAML.parse(fs.readFileSync(manifestPath, 'utf8'))
  const screenlyConfig: BaseScreenlyMockData = structuredClone(
    defaultScreenlyConfig,
  )

  // Merge settings from manifest
  for (const [key, value] of Object.entries(manifest.settings) as [
    string,
    ScreenlyManifestField,
  ][]) {
    if (value.type === 'string' || value.type === 'secret') {
      const manifestField: ScreenlyManifestField = value
      const defaultValue = manifestField?.default_value ?? ''
      screenlyConfig.settings[key] = defaultValue
    }
  }

  // Override with mock-data.yml if it exists
  if (fs.existsSync(mockDataPath)) {
    const mockData = YAML.parse(fs.readFileSync(mockDataPath, 'utf8'))

    // Override metadata if present
    if (mockData.metadata) {
      Object.assign(screenlyConfig.metadata, mockData.metadata)
    }

    // Override settings if present
    if (mockData.settings) {
      Object.assign(screenlyConfig.settings, mockData.settings)
    }

    // Override cors_proxy_url if present
    if (mockData.cors_proxy_url) {
      screenlyConfig.cors_proxy_url = mockData.cors_proxy_url
    }
  }

  return screenlyConfig
}

export function screenlyDevServer(): Plugin {
  let config: BaseScreenlyMockData
  let rootDir: string

  return {
    name: 'screenly-dev-server',
    configureServer(server: ViteDevServer) {
      rootDir = server.config.root

      // Generate initial mock data
      config = generateMockData(rootDir)

      // Watch for changes to screenly.yml
      const manifestPath = path.resolve(rootDir, 'screenly.yml')
      fs.watch(manifestPath, () => {
        config = generateMockData(rootDir)
      })

      // Watch for changes to mock-data.yml if it exists
      const mockDataPath = path.resolve(rootDir, 'mock-data.yml')
      if (fs.existsSync(mockDataPath)) {
        fs.watch(mockDataPath, () => {
          config = generateMockData(rootDir)
        })
      }

      server.middlewares.use((req, res, next) => {
        if (req.url === '/screenly.js?version=1') {
          const screenlyJsContent = generateScreenlyObject(config)

          res.setHeader('Content-Type', 'application/javascript')
          res.end(screenlyJsContent)
          return
        }
        next()
      })
    },
  }
}
