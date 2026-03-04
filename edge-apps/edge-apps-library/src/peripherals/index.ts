import { ulid } from 'ulid'

import type { PeripheralStateMessage } from '../types/index.js'

// WebSocket address of the Peripheral Integrator (Octo-Avenger).
// Matches EDGEAPP_WS_PORT = 9010 in peripheral-integrator/src/constants.rs.
const PERIPHERAL_WS_URL = 'ws://127.0.0.1:9010'

const ETB = '\x17'

export interface PeripheralClient {
  register: (edgeAppId: string) => void
  watchState: (callback: (msg: PeripheralStateMessage) => void) => void
}

// eslint-disable-next-line max-lines-per-function
export function createPeripheralClient(): PeripheralClient {
  let ws: WebSocket | null = null
  let identified = false
  const subscribers: Array<(msg: PeripheralStateMessage) => void> = []
  const readings: Record<string, unknown> = {}

  function send(payload: unknown) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload) + ETB)
    }
  }

  function notifySubscribers() {
    const msg: PeripheralStateMessage = {
      request: {
        id: ulid(),
        edge_app_source_state: {
          states: Object.values(
            readings,
          ) as PeripheralStateMessage['request']['edge_app_source_state']['states'],
        },
      },
    }
    subscribers.forEach((cb) => cb(msg))
  }

  function connect() {
    ws = new WebSocket(PERIPHERAL_WS_URL)

    ws.onopen = () => {
      send({
        request: {
          id: ulid(),
          identification: { node_id: ulid(), description: 'Edge App' },
        },
      })
    }

    ws.onmessage = (e: MessageEvent) => {
      const text = (e.data as string).replace(ETB, '')
      let msg: Record<string, unknown>
      try {
        msg = JSON.parse(text) as Record<string, unknown>
      } catch {
        return
      }

      const response = msg.response as Record<string, unknown> | undefined
      if (
        response?.ok !== undefined &&
        (response.ok as Record<string, unknown>)?.identification !== undefined
      ) {
        identified = true
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
        notifySubscribers()
        send({
          response: { request_id: request.id, ok: 'edge_app_source_state' },
        })
        return
      }

      if (request?.downstream_node_event) {
        send({
          response: { request_id: request.id, ok: 'downstream_node_event' },
        })
        return
      }
    }

    ws.onerror = () => console.warn('[screenly] Peripheral WS error')
    ws.onclose = () => {
      identified = false
      setTimeout(connect, 2000)
    }
  }

  return {
    register(edgeAppId: string) {
      if (!ws) connect()
      const sendRegistration = () => {
        send({
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
      if (ws!.readyState === WebSocket.OPEN && identified) {
        sendRegistration()
      } else {
        ws!.addEventListener('message', function onIdentified() {
          if (identified) {
            sendRegistration()
            ws!.removeEventListener('message', onIdentified)
          }
        })
      }
    },

    watchState(callback: (msg: PeripheralStateMessage) => void) {
      if (!ws) connect()
      subscribers.push(callback)
    },
  }
}
