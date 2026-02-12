# Screenly CAP Alerting App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-cap-alerting --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting            | Description                                                      | Type               | Default      |
| ------------------ | ---------------------------------------------------------------- | ------------------ | ------------ |
| `cap_feed_url`     | URL or relative path to your CAP XML feed                        | required           | -            |
| `default_language` | Preferred language code when multiple languages are available    | optional           | `en`         |
| `display_errors`   | Display detailed error messages on screen for debugging purposes | optional, advanced | `false`      |
| `maximum_alerts`   | Maximum number of alerts to display simultaneously               | optional           | `Infinity`   |
| `mode`             | Operation mode: Production, Demo, or Test                        | optional           | `production` |
| `refresh_interval` | Minutes between feed updates                                     | optional           | `5`          |

### Modes

- **Production**: Fetches CAP data from the configured feed URL with offline caching support
- **Demo**: Displays random demo alerts (ignores feed URL if left empty)
- **Test**: Displays a static test alert for development and testing

### Nearest Exit Tags

Add tags to your Screenly screens (e.g., `exit:North Lobby`) to provide location-aware exit directions. The app substitutes `{{closest_exit}}` or `[[closest_exit]]` placeholders in alert instructions.

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```
