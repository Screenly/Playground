# Grafana Dashboard

Displays Grafana dashboards as images on Screenly screens with automatic refresh intervals.

## Features

- Render Grafana dashboards as images via the rendering API
- Automatic refresh at configurable intervals
- Dynamic resolution based on screen size
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

- `dashboard_id` - The unique ID of the Grafana dashboard (can be selected via dropdown when available)
- `refresh_interval` - The interval in seconds to refresh the dashboard image (default: 60)

The Grafana domain and service access token are automatically fetched from your Grafana integration setup.

### Getting Dashboard Information

1. **Select Your Dashboard**
   - You can select your dashboard from a dropdown list that automatically populates available dashboards from your Grafana instance
   - Alternatively, you can manually enter the dashboard ID

2. **Find Dashboard ID Manually**
   - Open your Grafana dashboard
   - The URL in the browser will look like: `https://your-domain.grafana.net/d/<dashboard_id>/<dashboard_slug>`
   - Extract the `<dashboard_id>` value (you don't need the slug)

3. **Example Configuration**

   ```yaml
   dashboard_id: abc123
   refresh_interval: 60
   ```

## Development

```bash
bun install      # Install dependencies
bun run build    # Build the app
bun run dev      # Start development server
```

## Testing

```bash
bun run test     # Run tests
```
