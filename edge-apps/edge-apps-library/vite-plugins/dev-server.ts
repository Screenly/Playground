/* eslint-disable max-lines */
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

type SensorType =
  | 'ambient_temperature'
  | 'humidity'
  | 'air_pressure'
  | 'secure_card_id'

const SENSOR_META: Record<
  SensorType,
  { channelName: string; unit: string | null }
> = {
  ambient_temperature: { channelName: 'my_living_room_temp', unit: '°C' },
  humidity: { channelName: 'room_humidity', unit: '%' },
  air_pressure: { channelName: 'room_pressure', unit: 'hPa' },
  secure_card_id: { channelName: 'room1_access', unit: null },
}

const MOCK_CARD_IDS = {
  operator: 'DEADBEEF',
  maintenance: 'CAFEBABE',
}

function makeMockSensorValue(sensor: SensorType): number | string {
  switch (sensor) {
    case 'ambient_temperature':
      return parseFloat((20 + Math.random() * 10).toFixed(2))
    case 'humidity':
      return parseFloat((40 + Math.random() * 40).toFixed(2))
    case 'air_pressure':
      return parseFloat((1000 + Math.random() * 30).toFixed(2))
    case 'secure_card_id':
      return Math.random() < 0.5
        ? MOCK_CARD_IDS.operator
        : MOCK_CARD_IDS.maintenance
  }
}

// Generates a 26-character ULID using Crockford's Base32 alphabet
// (0-9, A-Z excluding I, L, O, U): 10 timestamp chars + 16 random chars
function generateUlid(): string {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  let t = Date.now()
  let time = ''
  for (let i = 9; i >= 0; i--) {
    time = chars[t % 32] + time
    t = Math.floor(t / 32)
  }
  let rand = ''
  for (let i = 0; i < 16; i++) {
    rand += chars[Math.floor(Math.random() * 32)]
  }
  return time + rand
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

  // eslint-disable-next-line max-lines-per-function
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
        const ack =
          JSON.stringify({
            response: { request_id: requestId, ok: { identification: null } },
          }) + ETB
        ws.send(ack)
        // Push full state snapshot immediately after identification
        const initialSnapshot =
          JSON.stringify({
            request: {
              id: generateUlid(),
              edge_app_source_state: { states: buildStateSnapshot() },
            },
          }) + ETB
        ws.send(initialSnapshot)
        return
      }

      if (!identified) return

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
      if (!identified || ws.readyState !== ws.OPEN) return
      const event =
        JSON.stringify({
          request: {
            id: generateUlid(),
            edge_app_source_state: { states: buildStateSnapshot() },
          },
        }) + ETB
      ws.send(event)
    }, 5000)

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

// eslint-disable-next-line max-lines-per-function
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

        let ws = null
        let identified = false
        const subscribers = []
        const readings = {}

        // Generates a 26-character ULID using Crockford's Base32 alphabet
        // (0-9, A-Z excluding I, L, O, U): 10 timestamp chars + 16 random chars
        function generateUlid() {
          const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
          let t = Date.now(), time = ''
          for (let i = 9; i >= 0; i--) { time = chars[t % 32] + time; t = Math.floor(t / 32) }
          let rand = ''
          for (let i = 0; i < 16; i++) { rand += chars[Math.floor(Math.random() * 32)] }
          return time + rand
        }

        function send(payload) {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload) + ETB)
          }
        }

        function notifySubscribers() {
          const msg = { request: { id: generateUlid(), edge_app_source_state: { states: Object.values(readings) } } }
          subscribers.forEach(cb => cb(msg))
          dispatchEvent(new CustomEvent('screenly:peripheral', { detail: msg }))
        }

        function connect() {
          ws = new WebSocket(WS_URL)

          ws.onopen = () => {
            send({ request: { id: generateUlid(), identification: { node_id: generateUlid(), description: 'Edge App Dev' } } })
          }

          ws.onmessage = (e) => {
            const text = e.data.replace(ETB, '')
            let msg
            try { msg = JSON.parse(text) } catch { return }

            if (msg.response?.ok?.identification !== undefined) {
              identified = true
              return
            }

            if (msg.request?.edge_app_source_state) {
              msg.request.edge_app_source_state.states.forEach(s => { readings[s.name] = s })
              notifySubscribers()
              send({ response: { request_id: msg.request.id, ok: 'edge_app_source_state' } })
              return
            }

            if (msg.request?.downstream_node_event) {
              send({ response: { request_id: msg.request.id, ok: 'downstream_node_event' } })
              return
            }
          }

          ws.onerror = () => console.warn('[screenly] Peripheral WS error')
          ws.onclose = () => { identified = false; setTimeout(connect, 2000) }
        }

        return {
          register(edgeAppId) {
            if (!ws) connect()
            const sendRegistration = () => {
              send({ request: { id: generateUlid(), edge_app_registration: { id: edgeAppId, secret: '', requested_source_channels: [] } } })
            }
            if (ws.readyState === WebSocket.OPEN && identified) {
              sendRegistration()
            } else {
              ws.addEventListener('message', function onIdentified() {
                if (identified) {
                  sendRegistration()
                  ws.removeEventListener('message', onIdentified)
                }
              })
            }
          },
          watchState(callback) {
            if (!ws) connect()
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
