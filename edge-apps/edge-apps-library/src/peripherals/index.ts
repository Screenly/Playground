import { ulid } from 'ulid'

import type { EdgeAppSourceState } from '../types/index.js'

// WebSocket address of the hardware integration service on the Screenly player.
// Port 9010 is a fixed port defined in the player firmware for Edge App connections.
const PERIPHERAL_WS_URL = 'ws://127.0.0.1:9010'

const ETB = '\x17'

/**
 * Serializes `payload` as JSON, appends the ETB delimiter, and sends it over
 * the WebSocket connection to the hardware integration service.
 * Throws if the connection is not open or if the underlying send fails.
 */
function sendMessage(ws: WebSocket, payload: unknown): void {
  if (ws.readyState !== WebSocket.OPEN) {
    throw new Error('Cannot send message: WebSocket is not open')
  }
  try {
    ws.send(JSON.stringify(payload) + ETB)
  } catch (err) {
    throw new Error('Failed to send message', { cause: err })
  }
}

export interface PeripheralClient {
  register: (edgeAppId: string) => void
  watchState: (callback: (msg: EdgeAppSourceState) => void) => void
}

// eslint-disable-next-line max-lines-per-function
export function createPeripheralClient(): PeripheralClient {
  let ws: WebSocket | null = null
  const subscribers: Array<(msg: EdgeAppSourceState) => void> = []
  const readings: Record<string, unknown> = {}

  /**
   * Packages the latest cached sensor readings into a wire message and
   * dispatches it to every callback registered via watchState().
   */
  function notifySubscribers() {
    const msg: EdgeAppSourceState = {
      request: {
        id: ulid(),
        edge_app_source_state: {
          states: Object.values(
            readings,
          ) as EdgeAppSourceState['request']['edge_app_source_state']['states'],
        },
      },
    }
    subscribers.forEach((cb) => cb(msg))
  }

  function connect() {
    ws = new WebSocket(PERIPHERAL_WS_URL)

    ws.onmessage = (e: MessageEvent) => {
      const text = (e.data as string).replace(ETB, '')
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(text) as Record<string, unknown>
      } catch (err) {
        console.warn('Failed to parse peripheral message', err)
        return
      }

      const request = msg.request as Record<string, unknown> | undefined
      if (request?.edge_app_source_state) {
        const state = request.edge_app_source_state as {
          states: Array<{ name: string }>
        }
        state.states.forEach((s) => {
          readings[s.name] = s
        })
        // Trigger registered callbacks with the updated readings so the app
        // can react — e.g. refresh the temperature display or switch screens
        // based on a card read.
        notifySubscribers()
        sendMessage(ws!, {
          response: { request_id: request.id, ok: 'edge_app_source_state' },
        })
        return
      }

      if (request?.downstream_node_event) {
        sendMessage(ws!, {
          response: { request_id: request.id, ok: 'downstream_node_event' },
        })
        return
      }
    }

    ws.onerror = () => console.warn('Peripheral WebSocket error')
    ws.onclose = () => {
      setTimeout(connect, 2000)
    }
  }

  return {
    register(edgeAppId: string) {
      if (!ws) connect()
      const sendRegistration = () => {
        sendMessage(ws!, {
          request: {
            id: ulid(),
            edge_app_registration: {
              id: edgeAppId,
              secret: '',
              requested_source_channels: [],
            },
          },
        })
      }
      if (ws!.readyState === WebSocket.OPEN) {
        sendRegistration()
      } else {
        ws!.addEventListener('open', sendRegistration, { once: true })
      }
    },

    watchState(callback: (msg: EdgeAppSourceState) => void) {
      if (!ws) connect()
      subscribers.push(callback)
    },
  }
}
