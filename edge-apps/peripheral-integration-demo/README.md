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

Edge Apps consume sensor data via a single function call:

```js
screenly.peripherals?.watchState((readings) => {
  const tempReading = readings.find((r) => 'ambient_temperature' in r)
  if (tempReading) {
    setTemperature(tempReading.ambient_temperature)
  }

  const cardReading = readings.find((r) => 'secure_card_id' in r)
  if (cardReading) {
    const role = authenticate(cardReading.secure_card_id)
    if (role) showWelcomeThenSwitch(role)
  }
})
```

`screenly.js` (v2) owns the entire WebSocket lifecycle — handshake, ACKs, reconnection. Edge App developers write one line and receive the full state of all connected sensors.

**Sample data delivered to the callback:**

```json
[
  {
    "ambient_temperature": 21.896982,
    "name": "my_living_room_temp",
    "timestamp": 1772570314358,
    "unit": "°C"
  },
  {
    "secure_card_id": "DEADBEEF",
    "name": "room1_access",
    "timestamp": 1772570314358
  }
]
```

The callback fires once on connect with the full state of all channels, then again whenever any sensor value is updated.
