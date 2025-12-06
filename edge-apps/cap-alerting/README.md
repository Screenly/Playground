# CAP Alerting Edge App

Display Common Alerting Protocol (CAP) emergency alerts on Screenly digital signage screens.

## Features

- **Full CAP Support**: Parse and display CAP XML alerts with all essential fields including identifier, sender, event type, urgency, severity, certainty, headline, description, and instructions
- **Offline Operation**: Caches alerts in localStorage and continues operating when network is unavailable
- **Nearest Exit Integration**: Uses screen tags (e.g., `exit:North Lobby`) to provide location-aware exit directions
- **Flexible Settings**: Configure feed URL, refresh interval, language preferences, audio alerts, and more
- **Test Mode**: Built-in test mode with sample CAP file for demonstration and debugging

## Settings

- **CAP Feed URL**: URL or path to a CAP XML feed
- **Refresh Interval**: Time in minutes between feed updates (default: 5)
- **Default Language**: Preferred language when multiple info blocks exist (default: en)
- **Maximum Alerts**: Maximum number of alerts to display simultaneously (default: 3)
- **Play Audio Alerts**: Enable/disable audio playback from CAP resources
- **Offline Mode**: Use cached or bundled data instead of fetching from network
- **Test Mode**: Load bundled test CAP file for demonstration purposes
- **Demo Mode**: Enable demo mode with realistic CAP alerts (randomly selected)

## Nearest Exit Tags

To enable location-aware exit directions, assign tags to your Screenly screens using the format:

- `exit:North Lobby`
- `exit-South Stairwell`

The app will automatically inject the nearest exit information into alert instructions that contain the placeholder `{{closest_exit}}` or `[[closest_exit]]`.

## Demo Mode

The app includes three realistic demo scenarios that are randomly selected:

- **Fire Drill**: Bilingual fire drill alert with evacuation instructions
- **Severe Weather**: Severe thunderstorm warning with radar imagery
- **Extreme Emergency**: Tornado emergency with multiple resources

Demo mode automatically activates when:
- `demo_mode` is enabled
- Test mode is disabled
- No CAP feed URL is configured

To test locally with demo mode:

```bash
cd edge-apps/cap-alerting

# Generate mock data (creates mock-data.yml)
bun run generate-mock-data

# Edit mock-data.yml and add a tag like:
# tags: ["exit:North Stairwell"]

# Run the app
bun run dev
```

Then access the app at the URL shown in the terminal and enable `demo_mode` in the settings. Each refresh will randomly show one of the three demo scenarios.

## Testing

Enable Test Mode in the app settings to load the bundled test CAP file (`static/test.cap`) instead of fetching from a live feed. This allows you to verify parsing, rendering, and nearest-exit substitution without network dependencies.

## Development

All commands should be run from within the app directory:

```bash
cd edge-apps/cap-alerting
```

Install dependencies:

```bash
bun install
```

Run tests:

```bash
bun test              # Run all tests
bun test --watch      # Watch mode
```

Run in development mode:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Deploy to Screenly:

```bash
bun run deploy
```

## License

MIT
