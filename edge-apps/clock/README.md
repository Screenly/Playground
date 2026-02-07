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

- `enable_analytics` - Enable or disable Sentry and Google Analytics integrations (optional, global)
- `openweathermap_api_key` - OpenWeatherMap API key to access weather data and location information (optional, global). Get your API key from https://openweathermap.org/api
- `override_locale` - Override the default locale with a supported language code (optional)
- `override_timezone` - Override the default timezone with a supported timezone identifier (optional)
- `tag_manager_id` - Google Tag Manager container ID to enable tracking and analytics (optional, global)
- `theme` - Visual theme for the app: 'light' or 'dark' (required, default: 'dark')
- `unit` - Measurement unit for temperature display: 'metric' (°C) or 'imperial' (°F) (optional, default: 'metric')

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
