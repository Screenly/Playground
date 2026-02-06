# Screenly Clock App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-clock-new --in-place
screenly edge-app deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

- `enable_analytics` - Enable or disable Sentry and Google Analytics integrations (true/false)
- `openweathermap_api_key` - OpenWeatherMap API key to access weather data (optional)
- `override_locale` - Override the default locale with a supported language code
- `override_timezone` - Override the default timezone with a supported timezone identifier
- `tag_manager_id` - Google Tag Manager container ID to enable tracking and analytics
- `theme` - Visual theme for the app ('light' or 'dark')

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
