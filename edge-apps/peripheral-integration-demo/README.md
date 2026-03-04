# Peripheral Integration Demo

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name peripheral-integration-demo --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting             | Description                                                                                                                                                   | Type     | Default |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- |
| `display_errors`    | Display errors on screen for debugging purposes                                                                                                               | optional | `false` |
| `override_locale`   | Override the default locale with a supported language code                                                                                                    | optional | `en`    |
| `override_timezone` | Override the default timezone with a supported timezone identifier (e.g., `Europe/London`, `America/New_York`). Defaults to the system timezone if left blank | optional | -       |

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```

## Screenshots

Generate screenshots at all supported resolutions:

```bash
bun run screenshots
```

Screenshots are saved to the `screenshots/` directory.

## Peripheral API

Edge Apps consume sensor data using `createPeripheralClient()` from `@screenly/edge-apps`:

```js
import { createPeripheralClient } from '@screenly/edge-apps'

const client = createPeripheralClient()
client.register(edgeAppId)

client.watchState((msg) => {
  const states = msg.request.edge_app_source_state.states

  const tempReading = states.find((r) => 'ambient_temperature' in r)
  if (tempReading) {
    setTemperature(tempReading.ambient_temperature)
  }

  const cardReading = states.find((r) => 'secure_card' in r)
  if (cardReading) {
    const uid = cardReading.secure_card.uid
    const role = authenticate(uid)
    if (role) showWelcomeThenSwitch(role)
  }
})
```

The client handles the WebSocket lifecycle — handshake, ACKs, and reconnection.

**Sample data delivered to the callback:**

```json
{
  "request": {
    "id": "01KJTPS9C0NV33QENDF3B4MXMV",
    "edge_app_source_state": {
      "states": [
        {
          "name": "temperature",
          "ambient_temperature": 23.5,
          "unit": "°C",
          "timestamp": 1772570314358
        },
        {
          "name": "humidity",
          "humidity": 32.2,
          "unit": "%",
          "timestamp": 1772570314358
        },
        {
          "name": "pressure",
          "air_pressure": 919.5,
          "unit": "hPa",
          "timestamp": 1772570314358
        },
        {
          "name": "ew_demo_nfc_reader",
          "secure_card": { "uid": "yHSl7w" },
          "timestamp": 1772570314358
        }
      ]
    }
  }
}
```

The callback fires once on connect with the full state of all channels, then again whenever any sensor value is updated.
