# Screenly Calendar App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name calendar --in-place
bun run deploy
screenly edge-app instance create
```

Configure the required settings:

```bash
screenly edge-app setting set ical_url=<YOUR_ICAL_URL>
screenly edge-app setting set bypass_cors=true
```

## Configuration

| Setting             | Description                                                                                            | Type     | Default    |
| ------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ---------- |
| `ical_url`          | iCal feed URL for your calendar (required)                                                             | secret   | -          |
| `calendar_mode`     | View mode: `schedule`, `weekly`, or `daily`                                                            | optional | `schedule` |
| `bypass_cors`       | Enable CORS bypass for iCal URLs that require it                                                       | optional | `true`     |
| `override_locale`   | Override the default locale (e.g. `fr`, `de`)                                                          | optional | `en`       |
| `override_timezone` | Override the default timezone (e.g. `America/New_York`). Defaults to the system timezone if left blank | optional | -          |
| `display_errors`    | Display errors on screen for debugging purposes                                                        | optional | `false`    |
| `sentry_dsn`        | Sentry DSN for error tracking and monitoring                                                           | optional | -          |

## Development

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Update `mock-data.yml` with your `ical_url` and set `bypass_cors` to `true`.

See [Getting the iCal URL](#getting-the-ical-url) for instructions.

## Linting and Formatting

```bash
bun run lint
bun run format
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

## Getting the iCal URL

- Go to your [Google Calendar](https://google.com/calendar).
- On the left sidebar, under "My calendars", select the calendar you want to use.
- Click on the three dots on the right side of the calendar and select "Settings and sharing".
- Scroll down until you see "Secret address in iCal format". Click on the copy button to the right.
- A "Security warning" will appear — click "OK" to continue.
- The secret address will be copied to your clipboard, which you can use in the Edge App settings.
