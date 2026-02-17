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

function generateMockData(
  rootDir: string,
  previousConfig: BaseScreenlyMockData = defaultScreenlyConfig,
): BaseScreenlyMockData {
  const manifestPath = path.resolve(rootDir, 'screenly.yml')
  const mockDataPath = path.resolve(rootDir, 'mock-data.yml')

  let manifest: Record<string, unknown>
  try {
    if (!fs.existsSync(manifestPath)) {
      console.warn(
        `screenly.yml not found at ${manifestPath}, using previous config.`,
      )
      return previousConfig
    }
    manifest = YAML.parse(fs.readFileSync(manifestPath, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn(
      `Failed to parse screenly.yml: ${message}. Using previous config.`,
    )
    return previousConfig
  }

  const screenlyConfig: BaseScreenlyMockData = structuredClone(
    defaultScreenlyConfig,
  )

  // Merge settings from manifest
  if (manifest?.settings && typeof manifest.settings === 'object') {
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
  }

  // Override with mock-data.yml if it exists
  if (fs.existsSync(mockDataPath)) {
    let mockData: Record<string, unknown>
    try {
      mockData = YAML.parse(fs.readFileSync(mockDataPath, 'utf8'))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.warn(
        `Failed to parse mock-data.yml: ${message}. Keeping config without mock-data overrides.`,
      )
      return screenlyConfig
    }

    if (mockData && typeof mockData === 'object') {
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
        screenlyConfig.cors_proxy_url = mockData.cors_proxy_url as string
      }
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

      // Watch for changes to screenly.yml and mock-data.yml using Vite's watcher
      const manifestPath = path.resolve(rootDir, 'screenly.yml')
      const mockDataPath = path.resolve(rootDir, 'mock-data.yml')

      const handleConfigFileChange = (file: string) => {
        if (file === manifestPath || file === mockDataPath) {
          config = generateMockData(rootDir, config)
        }
      }

      server.watcher.add([manifestPath, mockDataPath])
      server.watcher.on('add', handleConfigFileChange)
      server.watcher.on('change', handleConfigFileChange)
      server.watcher.on('unlink', handleConfigFileChange)

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
