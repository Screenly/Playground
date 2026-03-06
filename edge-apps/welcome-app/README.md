# Welcome App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name welcome-app --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting             | Description                                                                                                                                                   | Type     | Default        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------- |
| `enable_analytics`  | Enable or disable Sentry and Google Analytics integrations                                                                                                    | optional | `true`         |
| `override_locale`   | Override the default locale with a supported language code (e.g., `en_US`, `fr_FR`, `de_DE`)                                                                  | optional | `en`           |
| `override_timezone` | Override the default timezone with a supported timezone identifier (e.g., `Europe/London`, `America/New_York`). Defaults to the system timezone if left blank | optional | -              |
| `tag_manager_id`    | Google Tag Manager container ID to enable tracking and analytics                                                                                              | optional | `GTM-P98SPZ9Z` |
| `theme`             | Visual theme for the application (`light` or `dark`)                                                                                                          | required | `light`        |
| `welcome_heading`   | Heading text displayed as the welcome message title                                                                                                           | required | `Welcome`      |
| `welcome_message`   | Body text displayed as the welcome message content                                                                                                            | required | `to the team`  |

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Build

```bash
bun run build    # Build for production
```

## Lint & Format

```bash
bun run lint     # Lint and auto-fix
bun run format   # Format source files
```

## Testing

```bash
bun test         # Run unit tests
```

## Screenshots

Generate screenshots at all supported resolutions:

```bash
bun run screenshots
```

Screenshots are saved to the `screenshots/` directory.
