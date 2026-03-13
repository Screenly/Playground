import type { ViteDevServer, Plugin } from 'vite'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import { WebSocketServer } from 'ws'
import { ulid } from 'ulid'

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

const PERIPHERAL_WS_PORT = 9010
const ETB = '\x17'

type SensorType =
  | 'ambient_temperature'
  | 'humidity'
  | 'air_pressure'
  | 'secure_card'

const SENSOR_META: Record<
  SensorType,
  { channelName: string; unit: string | null }
> = {
  ambient_temperature: { channelName: 'my_living_room_temp', unit: '°C' },
  humidity: { channelName: 'room_humidity', unit: '%' },
  air_pressure: { channelName: 'room_pressure', unit: 'hPa' },
  secure_card: { channelName: 'ew_demo_nfc_reader', unit: null },
}

const MOCK_CARD_UIDS = {
  operator: 'uhtzBg',
  maintenance: 'gj-6XA',
}

function makeMockSensorValue(
  sensor: SensorType,
): number | Record<string, string> {
  switch (sensor) {
    case 'ambient_temperature':
      return parseFloat((20 + Math.random() * 10).toFixed(2))
    case 'humidity':
      return parseFloat((40 + Math.random() * 40).toFixed(2))
    case 'air_pressure':
      return parseFloat((1000 + Math.random() * 30).toFixed(2))
    case 'secure_card':
      return {
        uid:
          Math.random() < 0.5
            ? MOCK_CARD_UIDS.operator
            : MOCK_CARD_UIDS.maintenance,
      }
  }
}

function buildStateSnapshot(): Record<string, unknown>[] {
  return (
    Object.entries(SENSOR_META) as [
      SensorType,
      { channelName: string; unit: string | null },
    ][]
  ).map(([wireKey, meta]) => {
    const reading: Record<string, unknown> = {
      name: meta.channelName,
      [wireKey]: makeMockSensorValue(wireKey),
      timestamp: Date.now(),
    }
    if (meta.unit) reading.unit = meta.unit
    return reading
  })
}

// eslint-disable-next-line max-lines-per-function
function startPeripheralMockServer(): void {
  const wss = new WebSocketServer({ port: PERIPHERAL_WS_PORT })

  wss.on('connection', (ws) => {
    // Push full state snapshot immediately on connection
    const initialSnapshot =
      JSON.stringify({
        request: {
          id: ulid(),
          edge_app_source_state: { states: buildStateSnapshot() },
        },
      }) + ETB
    ws.send(initialSnapshot)

    ws.on('message', (raw: Buffer) => {
      const text = raw.toString().replace(ETB, '')
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(text)
      } catch {
        return
      }

      const req = msg.request as Record<string, unknown> | undefined
      if (!req) return

      const requestId = req.id as string

      // Registration is fire-and-forget — no response needed
      if (req.edge_app_registration) return

      // GetState request
      const channelName = req.source_channel_get_state as string | undefined
      const sensorEntry = channelName
        ? (
            Object.entries(SENSOR_META) as [
              SensorType,
              { channelName: string; unit: string | null },
            ][]
          ).find(([, meta]) => meta.channelName === channelName)
        : undefined
      if (sensorEntry) {
        const [wireKey, meta] = sensorEntry
        const value = makeMockSensorValue(wireKey)
        const reading: Record<string, unknown> = {
          name: channelName,
          [wireKey]: value,
          timestamp: Date.now(),
        }
        if (meta.unit) reading.unit = meta.unit
        const response =
          JSON.stringify({
            response: {
              request_id: requestId,
              ok: { source_channel_get_state: reading },
            },
          }) + ETB
        ws.send(response)
      }
    })

    // Push full state snapshot every 5 seconds
    const interval = setInterval(() => {
      if (ws.readyState !== ws.OPEN) return
      const event =
        JSON.stringify({
          request: {
            id: ulid(),
            edge_app_source_state: { states: buildStateSnapshot() },
          },
        }) + ETB
      ws.send(event)
    }, 10000)

    ws.on('close', () => clearInterval(interval))
  })

  wss.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(
        `[screenly-dev-server] Port ${PERIPHERAL_WS_PORT} already in use — peripheral mock not started.`,
      )
    } else {
      console.error('[screenly-dev-server] Peripheral WS error:', err.message)
    }
  })

  console.log(
    `[screenly-dev-server] Peripheral mock WS server listening on ws://127.0.0.1:${PERIPHERAL_WS_PORT}`,
  )
}

function generateScreenlyObject(config: BaseScreenlyMockData) {
  return `
    // Generated screenly.js for development mode
    window.screenly = {
      signalReadyForRendering: () => {},
      metadata: ${JSON.stringify(config.metadata, null, 2)},
      settings: ${JSON.stringify(config.settings, null, 2)},
      cors_proxy_url: ${JSON.stringify(config.cors_proxy_url)},
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

  applyMockDataOverrides(mockDataPath, screenlyConfig)

  return screenlyConfig
}

function applyMockDataOverrides(
  mockDataPath: string,
  screenlyConfig: BaseScreenlyMockData,
): void {
  if (!fs.existsSync(mockDataPath)) return

  // Typed as unknown since YAML.parse() can return any value (string, array, null, etc.)
  let parsedMockData: unknown
  try {
    parsedMockData = YAML.parse(fs.readFileSync(mockDataPath, 'utf8'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.warn(
      `Failed to parse mock-data.yml: ${message}. Keeping config without mock-data overrides.`,
    )
    return
  }

  // Narrow to a plain object after ruling out null, primitives, and arrays
  if (
    !parsedMockData ||
    typeof parsedMockData !== 'object' ||
    Array.isArray(parsedMockData)
  )
    return

  const mockData = parsedMockData as Record<string, unknown>

  const { metadata, settings, cors_proxy_url } = mockData

  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    Object.assign(screenlyConfig.metadata, metadata)
  }
  if (settings && typeof settings === 'object' && !Array.isArray(settings)) {
    Object.assign(screenlyConfig.settings, settings)
  }
  if (typeof cors_proxy_url === 'string' && cors_proxy_url.length > 0) {
    screenlyConfig.cors_proxy_url = cors_proxy_url
  }
}

export function screenlyDevServer(): Plugin {
  let config: BaseScreenlyMockData
  let rootDir: string

  return {
    name: 'screenly-dev-server',
    configureServer(server: ViteDevServer) {
      rootDir = server.config.root

      // Start peripheral mock WebSocket server
      startPeripheralMockServer()

      // Generate initial mock data
      config = generateMockData(rootDir)

      // Watch for changes to screenly.yml and mock-data.yml using Vite's watcher
      const manifestPath = path.resolve(rootDir, 'screenly.yml')
      const mockDataPath = path.resolve(rootDir, 'mock-data.yml')

      const handleConfigFileChange = (file: string) => {
        if (file === manifestPath || file === mockDataPath) {
          config = generateMockData(rootDir, config)
          // Notify connected clients to perform a full reload so they pick up the new mock config
          server.ws.send({ type: 'full-reload', path: '*' })
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
