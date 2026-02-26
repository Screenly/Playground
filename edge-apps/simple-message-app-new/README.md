# Simple Message App New

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name simple-message-app-new --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting             | Description                                                                                                                                                   | Type     | Default              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------- |
| `enable_analytics`  | Enable or disable Sentry and Google Analytics integrations                                                                                                    | optional | `true`               |
| `message_body`      | The main text content displayed in the message body card                                                                                                      | required | _(default text)_     |
| `message_header`    | The headline text displayed prominently on the left side                                                                                                      | required | `Simple Message App` |
| `override_locale`   | Override the default locale with a supported language code (e.g., `en`, `fr`, `de`)                                                                           | optional | `en`                 |
| `override_timezone` | Override the default timezone with a supported timezone identifier (e.g., `Europe/London`, `America/New_York`). Defaults to the system timezone if left blank | optional | -                    |
| `tag_manager_id`    | Google Tag Manager container ID to enable tracking and analytics                                                                                              | optional | `GTM-P98SPZ9Z`       |
| `theme`             | Visual theme for the application (`light` or `dark`)                                                                                                          | required | `light`              |

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun run test:unit
```

## Screenshots

Generate screenshots at all supported resolutions:

```bash
bun run screenshots
```

Screenshots are saved to the `screenshots/` directory.
