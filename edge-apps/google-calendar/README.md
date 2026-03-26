# Screenly Google Calendar App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name google-calendar --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting             | Description                                                                                                                                | Type     | Default    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---------- |
| `access_token`      | OAuth access token for Google Calendar API. For testing only — in production, tokens are fetched dynamically via the Screenly integration. | optional | -          |
| `calendar_id`       | Google Calendar ID to display events from (e.g. `primary` or `your@gmail.com`)                                                             | optional | `primary`  |
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

Update `mock-data.yml` with your `access_token` and `calendar_id`.

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

## Connecting to Google Calendar

This app uses the **Google Calendar API** (not iCal/ICS) and requires a Google OAuth access token. In production, Screenly manages the OAuth flow automatically.

To connect your Google account:

1. Go to the [Integrations](https://app.screenlyapp.com/manage/integrations) page in Screenly.
2. Click **+ Connect** next to **Google Calendar**.
3. Follow the OAuth consent flow to grant Screenly access to your Google Calendar data.

Once connected, the app will fetch and refresh the access token automatically.

## Getting the Calendar ID

1. Open [Google Calendar](https://calendar.google.com/).
2. In the left sidebar, hover over the calendar you want, click the **⋮** menu, then **Settings and sharing**.
3. Scroll down to **Integrate calendar**.
4. Copy the **Calendar ID** (e.g. `primary` or `your@gmail.com` for the primary calendar, or a longer ID like `abc123@group.calendar.google.com` for shared calendars).
5. Use this value as your `calendar_id` setting.
