# Grafana Dashboard

Embeds a Grafana dashboard in a Screenly Edge App.

## Features

- Display Grafana dashboards on Screenly screens
- Support for public or authenticated dashboard URLs
- Responsive design for landscape and portrait displays
- Theme color integration via @screenly/edge-apps

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-grafana --in-place
screenly edge-app deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

- `grafana_url` - The full URL to your Grafana dashboard

## Development

```bash
bun install      # Install dependencies
bun run build    # Build the app
bun test         # Run tests
```

## Testing

```bash
bun test
```
