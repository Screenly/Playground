# Screenly QR Code Generator App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-qr-code --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting          | Description                              | Type     | Default |
| ---------------- | ---------------------------------------- | -------- | ------- |
| `call_to_action` | Instruction text below headline          | optional | -       |
| `enable_utm`     | Add UTM tracking parameters (true/false) | optional | -       |
| `headline`       | Main message displayed above QR code     | optional | -       |
| `url`            | The URL to encode in the QR code         | required | -       |

### UTM Parameters

When `enable_utm` is enabled, the following parameters are automatically added:

- `utm_source=screenly`
- `utm_medium=digital-signage`
- `utm_location` - Screen location from metadata
- `utm_placement` - Screen hostname from metadata

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```
