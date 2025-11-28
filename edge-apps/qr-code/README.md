# QR Code Generator

Generate QR codes from URLs with optional UTM tracking parameters.

## Features

- Generate QR codes as SVG elements
- Optional UTM parameter tracking
- Customizable headline and call-to-action text
- Theme color integration via @screenly/edge-apps

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-qr-code --in-place
screenly edge-app deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

- `url` - The URL to encode in the QR code
- `enable_utm` - Add UTM tracking parameters (true/false)
- `headline` - Main message displayed above QR code
- `call_to_action` - Instruction text below headline

## UTM Parameters

When `enable_utm` is enabled, the following parameters are automatically added:

- `utm_source=screenly`
- `utm_medium=digital-signage`
- `utm_location` - Screen location from metadata
- `utm_placement` - Screen hostname from metadata

## Development

```bash
bun install      # Install dependencies
bun run build    # Build the app
bun test         # Run tests
```

## Testing

The app includes comprehensive tests for UTM parameter generation and URL handling.

```bash
bun test
```
