# Screenly Simple Table App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name simple-table --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting             | Description                                                                                                                                                   | Type     | Default                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------- |
| `content`           | CSV data to display. The first row is treated as column headers.                                                                                              | required | `Name,Age\nJohn,25\nJane,30` |
| `override_locale`   | Override the default locale with a supported language code                                                                                                    | optional | `en`                         |
| `override_timezone` | Override the default timezone with a supported timezone identifier (e.g., `Europe/London`, `America/New_York`). Defaults to the system timezone if left blank | optional | -                            |
| `title`             | Optional title displayed above the table. Leave empty to hide.                                                                                                | optional | -                            |

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

Update `mock-data.yml` with your desired CSV content and settings.

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
