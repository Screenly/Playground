# Sample Edge App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name sample-edge-app --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting             | Description                                                                                                                                                   | Type     | Default         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------- |
| `display_errors`    | Display errors on screen for debugging purposes                                                                                                               | optional | `false`         |
| `message`           | The message to display on screen                                                                                                                              | required | `Hello, World!` |
| `override_locale`   | Override the default locale with a supported language code                                                                                                    | optional | `en`            |
| `override_timezone` | Override the default timezone with a supported timezone identifier (e.g., `Europe/London`, `America/New_York`). Defaults to the system timezone if left blank | optional | -               |

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```

## Screenshots

Generate screenshots at all supported resolutions:

```bash
bun run screenshots
```

Screenshots are saved to the `screenshots/` directory.
