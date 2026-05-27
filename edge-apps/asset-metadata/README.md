# Asset Metadata

Displays screen metadata on Screenly digital signage players, including hostname, screen name, hardware type, firmware version, GPS coordinates, and assigned labels.

## Getting Started

```bash
bun install
```

## Development

```bash
bun run dev
```

## Building

```bash
bun run build
```

## Testing

```bash
bun run test
```

## Linting & Formatting

```bash
bun run lint
bun run format
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name asset-metadata --in-place
bun run deploy
screenly edge-app instance create
```

## Screenshots

Generate screenshots at all supported resolutions:

```bash
bun run screenshots
```

Screenshots are saved to the `screenshots/` directory.

## Configuration

| Setting          | Description                            | Type     | Default |
| ---------------- | -------------------------------------- | -------- | ------- |
| `display_errors` | Display errors on screen for debugging | optional | `false` |
