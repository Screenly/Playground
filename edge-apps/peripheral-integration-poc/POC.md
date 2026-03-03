# Peripheral Integration POC

**Date:** 2026-03-02

---

## TL;DR

The proposed API for Edge Apps to consume peripheral sensor data is a single function call:

```js
screenly.peripherals.subscribe((snapshot) => {
  console.log(snapshot.temperature_1.value, snapshot._timestamp)
})
```

`screenly.js` (v2) owns the entire WebSocket lifecycle — handshake, ACKs, reconnection. Edge App developers write one line and receive the full state of all connected sensors. That's it.

**Snapshot shape:**

```json
{
  "temperature_1": { "value": 22.22, "unit": "°C", "retrieved_at": 1740920445123 },
  "humidity_1":    { "value": 58.5,  "unit": "%",  "retrieved_at": 1740920445124 },
  "air_pressure_1":{ "value": 1013.25, "unit": "hPa", "retrieved_at": 1740920445125 },
  "_timestamp": 1740920445126,
  "_id": "01JNA4X0000PERIPHERAL0000001",
  "_uptime": 3600
}
```

The callback fires once on connect with a full snapshot of all channels, then again whenever any sensor value is updated.

Supported sensor types: `temperature`, `humidity`, `air_pressure`, `digital`, `analog`, `byte_array`.

---

## Background

This POC demonstrates peripheral integration in Screenly Edge Apps. The hardware team (Octo-Avenger repo, `murat/add-peripheral-integration-ecosystem` branch) is implementing a Peripheral Integrator service in Rust that exposes sensor data over a local WebSocket server.

---

## Protocol Summary (from Octo-Avenger assessment)

- **Transport:** WebSocket, `ws://127.0.0.1:9010` (localhost only)
- **Port constant:** `EDGEAPP_WS_PORT = 9010`
- **Frame delimiter:** Every JSON message is terminated with a `0x17` (ETB) byte
- **Library used (Rust side):** `tokio-tungstenite`

### Handshake

Before any data can flow, the client must identify itself:

```json
// Send (+ 0x17)
{ "request": { "id": "<ULID>", "identification": { "node_id": "<edge_app_id>", "description": "My Edge App" } } }

// Receive (+ 0x17)
{ "response": { "request_id": "<same_id>", "ok": { "identification": null } } }
```

### Request types (Edge App → Integrator)

| Request | Description |
|---|---|
| `identification` | Handshake at startup |
| `source_channel_get_state` | Query current value for a named channel |
| `source_channel_get_history` | Query time-series data for a named channel |

### Unsolicited push events (Integrator → Edge App)

The integrator pushes events without a request. The client **must ACK** each one — the integrator retries 5× then drops the connection on failure.

| Event | Description |
|---|---|
| `source_channel_event` | New sensor reading from driver |
| `downstream_node_event` | Driver error / disconnect / reconnect |

ACK shape:
```json
{ "response": { "request_id": "<event_request_id>", "ok": "source_channel_event" } }
```

### Wire format example (temperature)

```json
// GetState response
{
  "response": {
    "request_id": "<id>",
    "ok": {
      "source_channel_get_state": {
        "name": "temperature",
        "ambient_temperature": 22.22,
        "unit": "°C",
        "timestamp": "2026-03-02T14:30:45.123+03:00"
      }
    }
  }
}
```

### Sensor wire keys → normalized event mapping

| Sensor | Wire key | Unit |
|---|---|---|
| `temperature` | `ambient_temperature` | `°C` |
| `humidity` | `humidity` | `%` |
| `air_pressure` | `air_pressure` | `hPa` |
| `digital` | `digital` | `null` |
| `analog` | `analog` | `null` |
| `byte_array` | `byte_array` | `null` (base64url) |

---

## API Design Rationale

### Why a subscribe callback?

Sensors emit data continuously. A one-shot pull (`await screenly.peripherals()`) would require polling, which is ugly and misses rapid updates. A push model is the right abstraction.

### Why not expose the WebSocket directly?

Edge App developers shouldn't need to know about:
- The `0x17` ETB frame delimiter
- ULID generation for request IDs
- The identification handshake sequence
- ACKing unsolicited push events (with retry semantics)
- Reconnection logic

All of this is handled inside `screenly.js`. The Edge App only sees a normalized `PeripheralSnapshot` object.

### Why not `screenly.peripherals.init(channel, type, callback)`?

The original proposal included `channel-name` and `sensor-type` parameters. This was dropped — the simpler the better. `screenly.js` should discover channels internally and deliver all sensor events through a single subscriber.

### On `dispatchEvent`

In addition to the `subscribe` callback, `screenly.js` also dispatches a `CustomEvent` on `window` for each snapshot:

```js
window.addEventListener('screenly:peripheral', (e) => {
  console.log(e.detail) // same PeripheralSnapshot shape
})
```

This gives Edge Apps using framework event systems a native DOM integration point.

---

## Dev Server Mock

The peripheral mock is embedded in `edge-apps/edge-apps-library/vite-plugins/dev-server.ts`.

When `bun run dev` is started:

1. A WebSocket server starts on `ws://127.0.0.1:9010` (same port as the real integrator)
2. The generated `screenly.js` includes the full `peripherals` implementation as an IIFE
3. The mock server responds to the identification handshake, handles `source_channel_get_state` requests, and pushes `source_channel_event` messages every **3 seconds** for `temperature`, `humidity`, and `air_pressure`

If port 9010 is already in use (e.g. the real integrator is running), the mock server silently skips startup and the real hardware takes over — no code change needed.

---

## TypeScript Types

`PeripheralReading`, `PeripheralSnapshot`, and `ScreenlyPeripherals` are defined in `edge-apps/edge-apps-library/src/types/index.ts` and exported from `@screenly/edge-apps`.

```ts
interface PeripheralReading {
  value: number | string
  unit: string | null
  retrieved_at: number // Unix epoch milliseconds
}

interface PeripheralSnapshot {
  [channel: string]: PeripheralReading | number | string
  _timestamp: number  // Unix epoch milliseconds
  _id: string
  _uptime: number     // Player uptime in seconds
}

interface ScreenlyPeripherals {
  subscribe: (callback: (snapshot: PeripheralSnapshot) => void) => void
}
```

`screenly.peripherals` is optional on `ScreenlyObject` so existing Edge Apps that don't use peripherals continue to type-check without changes.

---

## Files Changed

| File | Change |
|---|---|
| `edge-apps/peripheral-integration-poc/` | New Edge App (this POC) |
| `edge-apps/edge-apps-library/vite-plugins/dev-server.ts` | Added `startPeripheralMockServer()` + `peripherals` IIFE in generated `screenly.js` |
| `edge-apps/edge-apps-library/src/types/index.ts` | Added `PeripheralReading`, `PeripheralSnapshot`, `ScreenlyPeripherals`, extended `ScreenlyObject` |
| `edge-apps/edge-apps-library/package.json` | Added `ws` + `@types/ws` dev dependencies |
