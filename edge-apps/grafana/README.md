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

- `domain` - The Grafana domain (e.g., `someone.grafana.net`)
- `dashboard_id` - The unique ID of the Grafana dashboard
- `dashboard_slug` - The URL-friendly name of the dashboard
- `service_access_token` - The Grafana service account token for authentication
- `refresh_interval` - The interval in seconds to refresh the dashboard image (default: 60)

### Getting Dashboard Information

1. **Find Your Dashboard ID and Slug**
   - Open your Grafana dashboard
   - The URL in the browser will look like: `https://your-domain.grafana.net/d/<dashboard_id>/<dashboard_slug>`
   - Extract the `<dashboard_id>` and `<dashboard_slug>` values

2. **Create a Service Account Token**
   - In Grafana, navigate to **Administration** &rarr; **Users and access** &rarr; **Service accounts**.
   - Click **Add service account**.
   - Enter a **Display Name** for the service account.
   - Assign **Role**s as needed. You can leave it empty.
   - Click **+ Add service account token**.
     - You can change the **Display Name** of the token if desired.
     - You can set an **Expiration** date for the token or leave it as **No expiration**.
   - Once ready, click **Generate token**.
   - A modal that says **Service account token created** will appear. Either click **Copy to clipboard** or **Copy to clipboard and close**.
     - You will not be able to see the token again, so make sure to copy it now and save it somewhere secure.

3. **Example Configuration**

   ```yaml
   domain: someone.grafana.net
   dashboard_id: abc123
   dashboard_slug: my-dashboard
   service_access_token: glsa_xxxxxxxxxxxx
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
