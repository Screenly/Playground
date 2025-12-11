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

### Getting an Embeddable Grafana URL

> [!NOTE] Grafana Cloud does not support embedding in iframes due to [security restrictions](https://grafana.com/docs/grafana/latest/setup-grafana/configure-security/?pg=blog&plcmt=body-txt#implications-of-enabling-anonymous-access-to-dashboards).

1. **Enable Embedding in Grafana**
   - If you self-host Grafana (Open Source or Enterprise), enable embedding by adding the following to your `grafana.ini`:

     ```ini
     [security]
     allow_embedding = true
     ```

   - Or set the environment variable: `GF_SECURITY_ALLOW_EMBEDDING=true`

   - This setting is supported in both Grafana Open Source and Enterprise editions, but **not available in Grafana Cloud**.

2. **Get the Dashboard URL**
   - Open your Grafana dashboard
   - Click the **Share** button (top right)
   - In the **Link** tab, copy the dashboard URL
   - Optionally, add query parameters like `?orgId=1&refresh=30s` to auto-refresh

3. **Example URL**

   ```txt
   https://grafana.example.org/d/abc123/dashboard-name?orgId=1&refresh=30s
   ```

> [!IMPORTANT] The Grafana URL must be **publicly accessible** from the Screenly player. Using `localhost` or internal network addresses will not work. Ensure your Grafana instance is accessible via a public URL or VPN that the player can reach.

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
