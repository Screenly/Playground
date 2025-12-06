# CAP Alerting Edge App

Display Common Alerting Protocol (CAP) emergency alerts on Screenly digital signage screens. Designed to work with [Override Playlist](https://developer.screenly.io/api-reference/v4/#tag/Playlists/operation/override_playlist) to automatically interrupt regular content when alerts are active.

## Settings

- **CAP Feed URL**: URL to your CAP XML feed
- **Refresh Interval**: Minutes between feed updates (default: 5)
- **Default Language**: Preferred language code (default: en)
- **Maximum Alerts**: Max alerts to display (default: 3)
- **Play Audio Alerts**: Enable audio playback from CAP `<resource>` elements with audio MIME types (default: false)
- **Offline Mode**: Use cached data when network unavailable
- **Test Mode**: Load bundled test CAP file
- **Demo Mode**: Show random demo alerts

## Audio Support

The app automatically detects and plays audio resources from CAP alerts when the "Play Audio Alerts" setting is enabled. Audio resources are identified by MIME types starting with `audio/` (e.g., `audio/mpeg`, `audio/wav`, `audio/ogg`). The audio player will attempt to autoplay when an alert is displayed, though browser autoplay policies may require user interaction in some cases.

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
