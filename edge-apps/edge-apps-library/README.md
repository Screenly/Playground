# @screenly/edge-apps

A TypeScript library for interfacing with the Screenly Edge Apps API.

## Installation

```bash
bun add @screenly/edge-apps
```

## Quick Start

```typescript
import { setupTheme, signalReady, getMetadata } from '@screenly/edge-apps'

setupTheme()
const metadata = getMetadata()
signalReady()
```

## Core Functions

### Theme & Branding

- `setupTheme()` - Apply theme colors to CSS custom properties
- `setupBrandingLogo()` - Fetch and process branding logo
- `setupBranding()` - Setup complete branding (colors and logo)

### Settings

- `getSettings()` - Get all settings
- `getSetting<T>(key)` - Get specific setting with type safety
- `getSettingWithDefault<T>(key, default)` - Get setting with fallback
- `signalReady()` - Signal app is ready for display

### Metadata

- `getMetadata()` - Get all screen metadata
- `getScreenName()`, `getHostname()`, `getLocation()`, `getHardware()`, `getScreenlyVersion()`, `getTags()`, `hasTag(tag)`, `getFormattedCoordinates()`

### Location

- `getTimeZone()` - Get timezone from GPS coordinates
- `getLocale()` - Get locale from location
- `formatCoordinates(coords)` - Format coordinates as string

### UTM Tracking

- `addUTMParams(url, params?)` - Add UTM parameters to URL
- `addUTMParamsIf(url, enabled, params?)` - Conditionally add UTM parameters

## Testing

```typescript
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

beforeEach(() => {
  setupScreenlyMock(
    { screen_name: 'Test Screen' },
    { theme: 'dark' }
  )
})

afterEach(() => {
  resetScreenlyMock()
})
```

## Types

```typescript
import type {
  ScreenlyMetadata,
  ScreenlySettings,
  ScreenlyObject,
  ThemeColors,
  BrandingConfig,
  UTMParams,
} from '@screenly/edge-apps'
```

## Development

```bash
bun install      # Install dependencies
bun test         # Run tests
bun run build    # Build library
```

## License

MIT
