# Screenly Simple Timer App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-simple-timer --in-place
screenly edge-app deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

- `display_errors` - Display detailed error messages on screen for debugging purposes (optional, advanced, default: 'false')
- `duration` - Timer duration in seconds (e.g., 60 for 1 minute, 300 for 5 minutes, 3600 for 1 hour) (required, default: '60')
- `override_locale` - Override the default locale with a supported language code (e.g., en, fr, de). Defaults to English if not specified (optional)
- `override_timezone` - Override the default timezone with a supported timezone identifier (e.g., Europe/London, America/New_York). Defaults to the system timezone if left blank (optional)

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
