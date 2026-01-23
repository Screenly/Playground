# CAP Alerting Edge App

Display Common Alerting Protocol (CAP) emergency alerts on Screenly digital signage screens. Designed to work with [Override Playlist](https://developer.screenly.io/api-reference/v4/#tag/Playlists/operation/override_playlist) to automatically interrupt regular content when alerts are active.

## Settings

- **CAP Feed URL**: URL or relative path to your CAP XML feed (required)
- **Display Errors**: Show errors on screen for debugging purposes (default: `false`, advanced setting)
- **Default Language**: Preferred language code when multiple languages are available (default: `en`)
- **Maximum Alerts**: Maximum number of alerts to display simultaneously (default: `Infinity`)
- **Mode**: Operation mode - Production, Demo, or Test (default: `production`)
- **Refresh Interval**: Minutes between feed updates (default: `5`)

## Modes

- **Production**: Fetches CAP data from the configured feed URL with offline caching support
- **Demo**: Displays random demo alerts (ignores feed URL if left empty)
- **Test**: Displays a static test alert for development and testing

## Nearest Exit Tags

Add tags to your Screenly screens (e.g., `exit:North Lobby`) to provide location-aware exit directions. The app substitutes `{{closest_exit}}` or `[[closest_exit]]` placeholders in alert instructions.

## Override Playlist Integration

This app is designed to use Screenly's [Override Playlist API](https://developer.screenly.io/api-reference/v4/#tag/Playlists/operation/override_playlist) to automatically interrupt regular content when alerts are active. Configure your backend to call the API when new CAP alerts are detected.

## Development

```bash
cd edge-apps/cap-alerting
bun install
bun run dev
bun test
```
