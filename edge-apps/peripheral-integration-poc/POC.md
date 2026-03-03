# Peripheral Integration POC

**Date:** 2026-03-02

---

## TL;DR

The proposed API for Edge Apps to consume peripheral sensor data is a single function call:

```js
screenly.peripherals.watchState((readings) => {
  readings.forEach((r) => console.log(r.name, r.timestamp))
})
```

`screenly.js` (v2) owns the entire WebSocket lifecycle — handshake, ACKs, reconnection. Edge App developers write one line and receive the full state of all connected sensors. That's it.

**Sample data delivered to the callback:**

```json
[
  {
    "ambient_temperature": 21.896982,
    "name": "my_living_room_temp",
    "timestamp": "2026-02-28T16:30:17.937+03:00",
    "unit": "°C"
  },
  {
    "secure_card_id": "DEADBEEF",
    "name": "room1_access",
    "timestamp": "2026-02-28T16:30:17.937+03:00"
  }
]
```

The callback fires once on connect with the full state of all channels, then again whenever any sensor value is updated.

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
| --- | --- |
| `identification` | Handshake at startup |
| `source_channel_get_state` | Query current value for a named channel |
| `source_channel_get_history` | Query time-series data for a named channel |

### Unsolicited push events (Integrator → Edge App)

The integrator pushes events without a request. The client **must ACK** each one — the integrator retries 5× then drops the connection on failure.

| Event | Description |
| --- | --- |
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

---

## API Design Rationale

### Why a watchState callback?

Sensors emit data continuously. A one-shot pull (`await screenly.peripherals()`) would require polling, which is ugly and misses rapid updates. A push model is the right abstraction.

### Why not expose the WebSocket directly?

Edge App developers shouldn't need to know about:
- The `0x17` ETB frame delimiter
- ULID generation for request IDs
- The identification handshake sequence
- ACKing unsolicited push events (with retry semantics)
- Reconnection logic

All of this is handled inside `screenly.js`. The Edge App only sees a normalized `PeripheralReading[]` array.

### Why not `screenly.peripherals.init(channel, type, callback)`?

The original proposal included `channel-name` and `sensor-type` parameters. This was dropped — the simpler the better. `screenly.js` should discover channels internally and deliver all sensor events through a single `watchState` call.

### On `dispatchEvent`

In addition to the `watchState` callback, `screenly.js` also dispatches a `CustomEvent` on `window` for each update. This gives Edge Apps using framework event systems a native DOM integration point.

---

## Dev Server Mock

The peripheral mock is embedded in `edge-apps/edge-apps-library/vite-plugins/dev-server.ts`.

When `bun run dev` is started:

1. A WebSocket server starts on `ws://127.0.0.1:9010` (same port as the real integrator)
2. The generated `screenly.js` includes the full `peripherals` implementation as an IIFE
3. The mock server responds to the identification handshake, handles `source_channel_get_state` requests, and pushes `source_channel_event` messages every **3 seconds** for `ambient_temperature` and `secure_card_id`

If port 9010 is already in use (e.g. the real integrator is running), the mock server silently skips startup and the real hardware takes over — no code change needed.

---

## Files Changed

| File | Change |
| --- | --- |
| `edge-apps/peripheral-integration-poc/` | New Edge App (this POC) |
| `edge-apps/edge-apps-library/vite-plugins/dev-server.ts` | Added `startPeripheralMockServer()` + `peripherals` IIFE in generated `screenly.js` |
| `edge-apps/edge-apps-library/src/types/index.ts` | Added `PeripheralReading`, `ScreenlyPeripherals`, extended `ScreenlyObject` |
| `edge-apps/edge-apps-library/package.json` | Added `ws` + `@types/ws` dev dependencies |
