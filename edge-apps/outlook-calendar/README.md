# Screenly Outlook Calendar App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name outlook-calendar --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting             | Description                                                                                                                                | Type     | Default    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- |
| `access_token`      | OAuth access token for Microsoft Graph API. For testing only — in production, tokens are fetched dynamically via the Screenly integration. | optional | -          |
| `calendar_id`       | Outlook Calendar ID to display events from. Leave blank to use the default calendar.                                                       | optional | -          |
| `calendar_mode`     | View mode: `schedule`, `weekly`, or `daily`                                                                                                | optional | `schedule` |
| `override_locale`   | Override the default locale (e.g. `fr`, `de`)                                                                                              | optional | `en`       |
| `override_timezone` | Override the default timezone (e.g. `America/New_York`). Defaults to the system timezone if left blank                                     | optional | -          |
| `display_errors`    | Display errors on screen for debugging purposes                                                                                            | optional | `false`    |
| `sentry_dsn`        | Sentry DSN for error tracking and monitoring                                                                                               | optional | -          |

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

Update `mock-data.yml` with your `screenly_app_auth_token` and set `screenly_oauth_tokens_url` to your local token proxy.

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

## Connecting to Outlook Calendar

This app uses the **Microsoft Graph API** and requires a Microsoft OAuth access token. In production, Screenly manages the OAuth flow automatically.

To connect your Microsoft account:

1. Go to the [Integrations](https://app.screenlyapp.com/manage/integrations) page in Screenly.
2. Click **+ Connect** next to **Outlook Calendar**.
3. Follow the OAuth consent flow to grant Screenly access to your Outlook Calendar data.

Once connected, the app will fetch and refresh the access token automatically.

## Getting the Calendar ID

By default, the app displays events from your primary Outlook calendar. To use a specific calendar:

1. Open [Outlook Web](https://outlook.live.com/) or the Outlook desktop app.
2. Right-click the calendar you want in the left sidebar and select **Calendar properties** (or **Settings**).
3. Copy the calendar ID from the URL or settings page.
4. Use this value as your `calendar_id` setting. Leave blank to use the default calendar.
