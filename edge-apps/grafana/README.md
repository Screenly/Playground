# Screenly Grafana App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-grafana --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting            | Description                                                                          | Type     | Default |
| ------------------ | ------------------------------------------------------------------------------------ | -------- | ------- |
| `dashboard_id`     | The unique ID of the Grafana dashboard (can be selected via dropdown when available) | required | -       |
| `refresh_interval` | The interval in seconds to refresh the dashboard image                               | optional | `60`    |

The Grafana domain and service access token are automatically fetched from your Grafana integration setup.

### Getting Dashboard Information

1. **Select Your Dashboard**
   - You can select your dashboard from a dropdown list that automatically populates available dashboards from your Grafana instance
   - Alternatively, you can manually enter the dashboard ID

2. **Find Dashboard ID Manually**
   - Open your Grafana dashboard
   - The URL in the browser will look like: `https://your-domain.grafana.net/d/<dashboard_id>/<dashboard_slug>`
   - Extract the `<dashboard_id>` value (you don't need the slug)

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```
