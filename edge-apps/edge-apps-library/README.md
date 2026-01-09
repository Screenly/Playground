# @screenly/edge-apps

A TypeScript library for interfacing with the Screenly Edge Apps API.

## Installation

```bash
bun add @screenly/edge-apps
```

### Local Development Setup

When developing Edge Apps locally using the library from this repository, you should link the package:

```bash
cd edge-apps/edge-apps-library
bun link
```

Then in your Edge App directory:

```bash
cd /path/to/your-edge-app
bun install
```

To unlink the package when you're done with local development:

```bash
cd edge-apps/edge-apps-library
bun unlink
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
- `getScreenName()`, `getHostname()`, `getLocation()`, `getScreenlyVersion()`, `getTags()`, `hasTag(tag)`, `getFormattedCoordinates()`
- `getHardware()` - Get hardware type as `Hardware` enum (`Anywhere`, `RaspberryPi`, or `ScreenlyPlayerMax`)

### Location & Localization

- `getTimeZone()` - Get timezone from GPS coordinates
- `getLocale()` - Get locale from location
- `formatCoordinates(coords)` - Format coordinates as string
- `formatLocalizedDate(date, locale)` - Format date for locale
- `formatTime(date, locale, timezone)` - Format time for locale
- `getLocalizedDayNames(locale)` - Get day names for locale
- `getLocalizedMonthNames(locale)` - Get month names for locale
- `detectHourFormat(locale)` - Detect 12h/24h format for locale

### UTM Tracking

- `addUTMParams(url, params?)` - Add UTM parameters to URL
- `addUTMParamsIf(url, enabled, params?)` - Conditionally add UTM parameters

## Edge Apps Scripts CLI

This package provides the `edge-apps-scripts` CLI tool for running shared development commands across all Edge Apps. It includes centralized ESLint configuration to avoid duplication.

### Available Commands

#### Linting

To lint your Edge App:

```bash
bun run lint
```

To lint and automatically fix issues:

```bash
bun run lint -- --fix
```

#### Building

```bash
bun run build
```

#### Type Checking

Run TypeScript type checking:

```bash
bun run type-check
```

### Command-Line Utilities for Edge Apps

- This library provides utilities to help with common Edge App tasks.
- The CLI uses the shared ESLint configuration from `@screenly/edge-apps`, so you don't need to maintain your own `eslint.config.ts`
- The build commands assume your Edge App has `src/main.ts` as the entry point
- Build output will be generated in the `dist/` directory

It is recommended to add the following scripts to your Edge App's `package.json`:

```json
{
  "scripts": {
    "lint": "edge-apps-scripts lint",
    "build": "edge-apps-scripts build",
    "build:dev": "edge-apps-scripts build:dev",
    "type-check": "edge-apps-scripts type-check"
  }
}
```

> [!NOTE]
> Feel free to customize the scripts as needed for your Edge App. You could also define your own configs like `eslint.config.ts`, `tsconfig.json`, or `vite.config.ts` if you need more control.

## Testing

```typescript
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

beforeEach(() => {
  setupScreenlyMock({ screen_name: 'Test Screen' }, { theme: 'dark' })
})

afterEach(() => {
  resetScreenlyMock()
})
```

## Types

```typescript
import type {
  Hardware,
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
