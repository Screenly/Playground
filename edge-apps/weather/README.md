# Screenly Weather App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-weather --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting                  | Description                                                                                                                                                   | Type               | Default |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------- |
| `openweathermap_api_key` | OpenWeatherMap API key to access weather data and location information. Get your API key from <https://openweathermap.org/api>                                | required           | -       |
| `override_coordinates`   | Comma-separated coordinates (e.g., `37.8267,-122.4233`) to override device location                                                                           | optional           | -       |
| `override_locale`        | Override the default locale with a supported language code                                                                                                    | optional           | `en`    |
| `override_timezone`      | Override the default timezone with a supported timezone identifier (e.g., `Europe/London`, `America/New_York`). Defaults to the system timezone if left blank | optional           | -       |
| `unit`                   | Measurement unit for temperature display: `auto` (automatically determined based on location), `metric` (Celsius), or `imperial` (Fahrenheit)                 | optional, advanced | `auto`  |

**Note:** When `unit` is set to `auto` (default), temperature units are automatically determined based on the device's location. The following countries use Fahrenheit: United States (US), Bahamas (BS), Cayman Islands (KY), Liberia (LR), Palau (PW), Federated States of Micronesia (FM), and Marshall Islands (MH). All other countries use Celsius.

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
