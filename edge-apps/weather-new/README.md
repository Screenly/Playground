# Weather Edge App

A Screenly Edge App that displays the current weather and hourly forecast.

## Settings

- **openweathermap_api_key** (required): OpenWeatherMap API key for weather data.
- **override_locale** (optional): Language code override (e.g., `en`, `fr`, `de`). Defaults to `en`.
- **override_coordinates** (optional): Comma-separated coordinates (e.g., `37.8267,-122.4233`).
- **enable_analytics** (optional): Enable or disable analytics integrations.
- **tag_manager_id** (optional): Google Tag Manager container ID.
- **sentry_dsn** (optional): Sentry DSN for error tracking.

## Development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

## Deploy

```bash
bun run deploy
```
