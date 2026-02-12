# Simple Timer - Screenly Edge App

A configurable countdown timer with a circular progress ring for Screenly digital signage. Designed for short-duration interval timing such as presentations, breaks, and meetings.

## Settings

| Setting             | Required | Default   | Description                                      |
| ------------------- | -------- | --------- | ------------------------------------------------ |
| `duration`          | Yes      | `60`      | Timer duration in seconds                        |
| `override_locale`   | No       | `en`      | Override locale for date formatting              |
| `override_timezone` | No       | _(empty)_ | Override timezone                                |
| `display_errors`    | No       | `false`   | Show detailed error messages (for debugging use) |

## Development

```bash
bun install
bun run dev
```

## Build & Deploy

```bash
bun run build
bun run deploy
```

## Testing

```bash
bun test
```
