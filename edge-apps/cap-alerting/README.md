# Screenly CAP Alerting App

Display Common Alerting Protocol (CAP) emergency alerts on Screenly digital signage screens. Designed to work with Screenly's [Playlist API](https://developer.screenly.io/api_v4/#update-a-playlist) (`PATCH /v4/playlists`) to automatically interrupt regular content when alerts are active by setting the playlist priority.

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-cap-alerting --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting            | Description                                                      | Type               | Default      |
| ------------------ | ---------------------------------------------------------------- | ------------------ | ------------ |
| `cap_feed_url`     | URL or relative path to your CAP XML feed                        | required           | -            |
| `display_errors`   | Display detailed error messages on screen for debugging purposes | optional, advanced | `false`      |
| `language`         | Preferred language code when multiple languages are available    | optional           | `en`         |
| `max_alerts`       | Maximum number of alerts to display simultaneously               | optional           | `Infinity`   |
| `mode`             | Operation mode: Production, Demo, or Test                        | optional           | `production` |
| `refresh_interval` | Minutes between feed updates                                     | optional           | `5`          |

### Modes

- **Production**: Fetches CAP data from the configured feed URL with offline caching support
- **Demo**: Displays random demo alerts (ignores feed URL if left empty)
- **Test**: Displays a static test alert for development and testing

### Nearest Exit Tags

Add tags to your Screenly screens (e.g., `exit:North Lobby`) to provide location-aware exit directions. The app substitutes `{{closest_exit}}` or `[[closest_exit]]` placeholders in alert instructions.

## NWS Text Product Formatting

The app automatically detects and formats National Weather Service (NWS) CAP alerts that use legacy text formats. This improves readability by converting abbreviated markers into clean, readable text with proper spacing and line breaks.

### Supported Formats

**1. Period-based Forecasts** (marine forecasts, zone forecasts)

Markers: `.TODAY...`, `.TONIGHT...`, `.MON...`, `.SUN NIGHT...`, etc.

Example transformation:

```text
.TODAY...E wind 20 kt. Seas 11 ft. .TONIGHT...E wind 20 kt.
```

becomes:

```text
TODAY: E wind 20 kt. Seas 11 ft.

TONIGHT: E wind 20 kt.
```

**2. Impact Based Warnings (WWWI format)**

Markers: `* WHAT...`, `* WHERE...`, `* WHEN...`, `* IMPACTS...`

Example transformation:

```text
* WHAT...North winds 25 to 30 kt. * WHERE...Coastal waters. * WHEN...Until 3 AM.
```

becomes:

```text
WHAT: North winds 25 to 30 kt.

WHERE: Coastal waters.

WHEN: Until 3 AM.
```

This formatting only applies to CAP alerts from the NWS sender (`w-nws.webmaster@noaa.gov`).

## Playlist Priority Integration

This app is designed to work with Screenly's Playlist API to automatically interrupt regular content when emergency alerts are active.

Configure your backend to call the [`PATCH /v4/playlists`](https://developer.screenly.io/api_v4/#update-a-playlist) endpoint:

- Set `priority: true` when new CAP alerts are detected to make this app take precedence over other content
- Set `priority: false` when alerts expire to resume normal playlist rotation

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
