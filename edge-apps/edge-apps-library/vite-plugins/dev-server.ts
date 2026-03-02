import type { ViteDevServer, Plugin } from 'vite'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import { WebSocketServer } from 'ws'

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

type SensorType = 'temperature' | 'humidity' | 'air_pressure' | 'digital' | 'analog' | 'byte_array'

const SENSOR_META: Record<SensorType, { wireKey: string; unit: string | null }> = {
  temperature: { wireKey: 'ambient_temperature', unit: '°C' },
  humidity: { wireKey: 'humidity', unit: '%' },
  air_pressure: { wireKey: 'air_pressure', unit: 'hPa' },
  digital: { wireKey: 'digital', unit: null },
  analog: { wireKey: 'analog', unit: null },
  byte_array: { wireKey: 'byte_array', unit: null },
}

function makeMockSensorValue(sensor: SensorType): number | string {
  switch (sensor) {
    case 'temperature': return parseFloat((20 + Math.random() * 10).toFixed(2))
    case 'humidity': return parseFloat((40 + Math.random() * 40).toFixed(2))
    case 'air_pressure': return parseFloat((1000 + Math.random() * 30).toFixed(2))
    case 'digital': return Math.round(Math.random())
    case 'analog': return parseFloat((Math.random() * 5).toFixed(3))
    case 'byte_array': return Buffer.from('mock').toString('base64url')
  }
}

function startPeripheralMockServer(): void {
  const wss = new WebSocketServer({ port: PERIPHERAL_WS_PORT })

  wss.on('connection', (ws) => {
    let identified = false

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

      // Identification handshake
      if (req.identification) {
        identified = true
        const ack = JSON.stringify({
          response: { request_id: requestId, ok: { identification: null } },
        }) + ETB
        ws.send(ack)
        return
      }

      if (!identified) return

      // GetState request
      const channelName = req.source_channel_get_state as string | undefined
      if (channelName && channelName in SENSOR_META) {
        const sensor = channelName as SensorType
        const meta = SENSOR_META[sensor]
        const value = makeMockSensorValue(sensor)
        const response = JSON.stringify({
          response: {
            request_id: requestId,
            ok: {
              source_channel_get_state: {
                name: channelName,
                [meta.wireKey]: value,
                unit: meta.unit,
                timestamp: new Date().toISOString(),
              },
            },
          },
        }) + ETB
        ws.send(response)
      }
    })

    // Push unsolicited sensor events every 3 seconds
    const activeSensors: SensorType[] = ['temperature', 'humidity', 'air_pressure']
    const interval = setInterval(() => {
      if (!identified || ws.readyState !== ws.OPEN) return
      const sensor = activeSensors[Math.floor(Math.random() * activeSensors.length)]
      const meta = SENSOR_META[sensor]
      const value = makeMockSensorValue(sensor)
      const requestId = `mock-push-${Date.now()}`
      const event = JSON.stringify({
        request: {
          id: requestId,
          source_channel_event: {
            name: sensor,
            [meta.wireKey]: value,
            unit: meta.unit,
            timestamp: new Date().toISOString(),
          },
        },
      }) + ETB
      ws.send(event)
    }, 3000)

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
      peripherals: (() => {
        const ETB = '\\x17'
        const WS_URL = 'ws://127.0.0.1:${PERIPHERAL_WS_PORT}'
        const SENSOR_META = {
          temperature: { wireKey: 'ambient_temperature', unit: '°C' },
          humidity: { wireKey: 'humidity', unit: '%' },
          air_pressure: { wireKey: 'air_pressure', unit: 'hPa' },
          digital: { wireKey: 'digital', unit: null },
          analog: { wireKey: 'analog', unit: null },
          byte_array: { wireKey: 'byte_array', unit: null },
        }

        let ws = null
        let identified = false
        const subscribers = []

        function generateUlid() {
          return Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 12).toUpperCase()
        }

        function send(payload) {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload) + ETB)
          }
        }

        function normalizeEvent(channelEvent) {
          for (const [sensor, meta] of Object.entries(SENSOR_META)) {
            if (meta.wireKey in channelEvent) {
              return {
                sensor,
                value: channelEvent[meta.wireKey],
                unit: meta.unit,
                timestamp: channelEvent.timestamp,
              }
            }
          }
          return null
        }

        function connect() {
          ws = new WebSocket(WS_URL)

          ws.onopen = () => {
            const id = generateUlid()
            send({ request: { id, identification: { node_id: generateUlid(), description: 'Edge App Dev' } } })
          }

          ws.onmessage = (e) => {
            const text = e.data.replace(ETB, '')
            let msg
            try { msg = JSON.parse(text) } catch { return }

            // Handle identification ACK
            if (msg.response?.ok?.identification !== undefined) {
              identified = true
              return
            }

            // Handle ACK requirement for unsolicited push events
            if (msg.request?.source_channel_event) {
              const event = normalizeEvent(msg.request.source_channel_event)
              if (event) {
                subscribers.forEach(cb => cb(event))
                dispatchEvent(new CustomEvent('screenly:peripheral', { detail: event }))
              }
              send({ response: { request_id: msg.request.id, ok: 'source_channel_event' } })
              return
            }

            if (msg.request?.downstream_node_event) {
              send({ response: { request_id: msg.request.id, ok: 'downstream_node_event' } })
              return
            }
          }

          ws.onerror = () => console.warn('[screenly] Peripheral WS error')
          ws.onclose = () => {
            identified = false
            setTimeout(connect, 2000)
          }
        }

        connect()

        return {
          subscribe(callback) {
            subscribers.push(callback)
          }
        }
      })()
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
