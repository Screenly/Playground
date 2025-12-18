# Simple Edge App Template

A minimal starter template for building custom Screenly Edge Apps.

## Features

- Simple message display
- Theme color integration via @screenly/edge-apps
- Ready signal support
- Minimal configuration

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-app --in-place
screenly edge-app deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

- `message` - The message to display on screen

## Development

```bash
bun install      # Install dependencies
bun run build    # Build the app
bun test         # Run tests
bun run dev      # Start development server
```

## Testing

```bash
bun test
```
