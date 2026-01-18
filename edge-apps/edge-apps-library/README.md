# @screenly/edge-apps

A TypeScript library for building Screenly Edge Apps with a complete design system, web components, and development tools.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Creating a New Edge App](#creating-a-new-edge-app)
- [Core Functions](#core-functions)
- [Web Components](#web-components)
- [Design System](#design-system)
- [Edge Apps Scripts CLI](#edge-apps-scripts-cli)
- [Development](#development)
- [Types](#types)
- [Testing](#testing)

## Installation

Apps in this repository use Bun workspaces to automatically link to the library. When you create a new app, it's already configured to use `workspace:../edge-apps-library` in its `package.json`, so no additional linking is required.

Simply install dependencies in your app:

```bash
cd edge-apps/your-app-name
bun install
```

The library will be automatically available via `@screenly/edge-apps` imports.

## Quick Start

### Declarative Approach (Recommended)

Use web components directly in your HTML:

```html
<!-- index.html -->
<body>
  <auto-scaler reference-width="1920" reference-height="1080" orientation="auto">
    <div id="app">
      <app-header show-date></app-header>
      <main>
        <!-- Your app content -->
      </main>
    </div>
  </auto-scaler>
  <edge-app-devtools reference-width="1920" reference-height="1080"></edge-app-devtools>
  
  <script src="screenly.js?version=1"></script>
  <script type="module" src="/src/main.ts"></script>
</body>
```

```typescript
// src/main.ts
import { signalReady, getMetadata } from '@screenly/edge-apps'
import '@screenly/edge-apps/components' // Register web components
import '@screenly/edge-apps/styles'
import './styles.css'

// Get metadata
const metadata = getMetadata()

// Signal app is ready
signalReady()
```

### Programmatic Approach (Legacy)

You can also use `initEdgeApp()` for programmatic setup:

```typescript
import { initEdgeApp, signalReady, getMetadata } from '@screenly/edge-apps'
import '@screenly/edge-apps/components'
import '@screenly/edge-apps/styles'
import './styles.css'

// Initialize Edge App with auto-scaling
initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  enableDevTools: import.meta.env.DEV,
})

// Get metadata
const metadata = getMetadata()

// Signal app is ready
signalReady()
```

## Creating a New Edge App

### Prerequisites

You are in the Playground repo root:

```bash
cd /Users/devanthakur/Documents/Projects/in-2/edge-apps/Playground
```

### 1. Generate a new Edge App

Recommended shortcut:

```bash
bun run create-app
```

This runs the shared `edge-apps-scripts` CLI and will:
- Prompt you for an **app name** (for example, `my-dashboard`) and keep asking until you provide a non-empty name.
- Scaffold a new directory under `edge-apps/` using the minimal TypeScript + Tailwind + Vite template.
- Print the next commands to run.

Alternatively, you can call the CLI directly:

```bash
bun edge-apps/edge-apps-library/bin/edge-apps-scripts.ts create
```

### 2. Install dependencies and start dev server

After generation, follow the printed steps (for an app named `my-dashboard`):

```bash
cd edge-apps/my-dashboard
bun install
bun run dev
```

Then open the dev server URL shown in the terminal.

### 3. Start editing your app

In your new app directory:
- `index.html` – HTML shell with `<auto-scaler>` and `<edge-app-devtools>` web components. Loads `screenly.js` and `src/main.ts`.
- `src/main.ts` – TypeScript entrypoint that registers components and signals ready.
- `src/styles.css` – Tailwind + Screenly design system styles.
- `tailwind.config.js` – Extends the base Tailwind config from the library.
- `screenly.yml` – Screenly Edge App manifest (ID, description, icon, settings).

You can modify these files to build your custom Edge App while keeping the underlying tooling (TypeScript, Vite, Tailwind, and `@screenly/edge-apps`) intact.

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

### UI/Layout Utilities

- `initEdgeApp(containerId, config)` - Programmatic initialization (legacy, use declarative approach instead)
- `<auto-scaler>` - Web component for automatic scaling to any screen resolution
- `<edge-app-devtools>` - Development overlay web component (auto-hidden in production)
- `isPortrait()` - Returns `true` if the screen is in portrait orientation
- `isLandscape()` - Returns `true` if the screen is in landscape orientation
- `getOrientation()` - Returns `'portrait'` or `'landscape'`

### Weather Utilities

Functions for working with weather data and icons:

- `getWeatherIconKey(weatherId, timestamp, timeZone)` - Maps OpenWeatherMap condition IDs to icon keys (handles day/night variants)
- `getWeatherIconUrl(iconKey, iconBase?)` - Returns the full URL path for a weather icon
- `isNightForTimestamp(timestamp, timeZone)` - Determines if a timestamp is during nighttime

**Example:**
```typescript
import { getWeatherIconKey, getWeatherIconUrl, getTimeZone } from '@screenly/edge-apps'

// Get weather data from API
const weatherId = data.weather[0].id // OpenWeatherMap condition ID
const timestamp = Math.floor(Date.now() / 1000)
const timeZone = await getTimeZone()

// Get icon key (handles day/night automatically)
const iconKey = getWeatherIconKey(weatherId, timestamp, timeZone)

// Get icon URL
const iconUrl = getWeatherIconUrl(iconKey, '/assets/images/icons')

// Update image element
const img = document.querySelector('[data-weather-icon]')
if (img) {
  img.src = iconUrl
}
```

### Shared Assets

The library includes shared assets that you can copy to your app if needed:

- **Weather Icons**: Located at `assets/images/icons/` in the library

If your app needs weather icons, copy them manually:

```bash
cp -r edge-apps/edge-apps-library/assets/images/icons edge-apps/your-app/assets/images/
```

**Note**: Not all apps need weather icons, so they are not automatically included when creating a new app. Only copy them if your app uses weather functionality.

## Web Components

Reusable web components for building consistent Edge Apps. All components are self-contained with HTML, CSS, and TypeScript in single files.

### `<auto-scaler>`

Automatically scales content from a reference resolution to any screen size.

**Usage:**
```html
<auto-scaler reference-width="1920" reference-height="1080" orientation="auto">
  <!-- Your app content sized for 1920×1080 -->
</auto-scaler>
```

**Attributes:**
- `reference-width` (required): Reference width in pixels (default: 1920)
- `reference-height` (required): Reference height in pixels (default: 1080)
- `orientation` (optional): "landscape", "portrait", or "auto" (default: "auto")
- `center-content` (optional): Center content horizontally (default: false)
- `padding` (optional): Padding in pixels (default: "20")
- `debounce-ms` (optional): Resize debounce delay in milliseconds (default: 100)

**Example:**
```html
<auto-scaler reference-width="1920" reference-height="1080" orientation="auto" center-content>
  <div id="app">
    <!-- Your content -->
  </div>
</auto-scaler>
```

### `<edge-app-devtools>`

Development overlay showing viewport, reference resolution, and scale. Only visible in development mode.

**Usage:**
```html
<edge-app-devtools reference-width="1920" reference-height="1080"></edge-app-devtools>
```

**Attributes:**
- `reference-width` (required): Reference width in pixels
- `reference-height` (required): Reference height in pixels

**Features:**
- Press 'D' to toggle visibility
- Shows viewport dimensions, reference resolution, scale, and orientation
- Automatically hidden in production

### `<brand-logo>`

Displays the branding logo from Screenly settings with fallback to screen name.

**Usage:**
```html
<brand-logo></brand-logo>
```

**Attributes:**
- `show-name` (optional): Show screen name alongside logo (default: false)
- `fallback-to-name` (optional): Show screen name if logo unavailable (default: true)
- `max-width` (optional): Maximum width for logo (default: "120px")
- `max-height` (optional): Maximum height for logo (default: "32px")

**Examples:**
```html
<!-- Basic usage -->
<brand-logo></brand-logo>

<!-- Show name alongside logo -->
<brand-logo show-name></brand-logo>

<!-- Custom size -->
<brand-logo max-width="200px" max-height="48px"></brand-logo>
```

### `<app-header>`

A flexible header component with branding and time display.

**Usage:**
```html
<app-header></app-header>
```

**Attributes:**
- `show-logo` (optional): Show brand logo (default: true)
- `show-time` (optional): Show time display (default: true)
- `show-date` (optional): Show date display (default: false)
- `time-format` (optional): Time format - "12h" or "24h" (default: auto-detect)

**Examples:**
```html
<!-- Basic usage -->
<app-header></app-header>

<!-- With date -->
<app-header show-date></app-header>

<!-- 24-hour format -->
<app-header time-format="24h"></app-header>
```

**Importing Components:**

```typescript
// Register all components
import '@screenly/edge-apps/components'
```

## Design System

The library provides a complete CSS design system with design tokens, component classes, and utilities.

### Importing the Design System

```typescript
// In your app's src/main.ts
import '@screenly/edge-apps/styles' // Import global design system
import './styles.css' // Your app-specific styles
```

Or in CSS:

```css
@import '@screenly/edge-apps/styles';
```

### Tailwind Configuration

The library provides a base Tailwind configuration that apps can extend:

```javascript
// tailwind.config.js
import baseConfig from '../edge-apps-library/configs/tailwind.config.base.js'

export default {
  ...baseConfig,
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      // Your app-specific extensions
    },
  },
  plugins: [
    ...baseConfig.plugins,
    // Your app-specific plugins
  ],
}
```

### Design Tokens

#### Colors

```css
--screenly-primary: #972eff
--screenly-secondary: #454bd2

--glass-bg: rgba(255, 255, 255, 0.1)
--glass-bg-dark: rgba(0, 0, 0, 0.3)
--glass-border: rgba(255, 255, 255, 0.2)

--overlay-light: rgba(0, 0, 0, 0.3)
--overlay-medium: rgba(0, 0, 0, 0.5)
--overlay-dark: rgba(0, 0, 0, 0.7)

--text-primary: rgba(255, 255, 255, 0.95)
--text-secondary: rgba(255, 255, 255, 0.7)
--text-muted: rgba(255, 255, 255, 0.5)
```

#### Typography

```css
/* Font Families */
--font-display: 'Inter', system-ui, sans-serif
--font-body: 'Inter', system-ui, sans-serif
--font-mono: 'Roboto Mono', monospace

/* Font Sizes (for 1920×1080 reference) */
--text-display-1: 12rem    /* 192px - Clock time */
--text-display-2: 8rem     /* 128px - Large headers */
--text-title-1: 4rem       /* 64px - Page titles */
--text-title-2: 3rem       /* 48px - Section titles */
--text-body-1: 2rem        /* 32px - Body text */
--text-body-2: 1.5rem      /* 24px - Small body */
--text-label: 1rem         /* 16px - Labels/chips */
```

#### Shadows

```css
--shadow-sm: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1)
--shadow-md: 0 0.25rem 1rem rgba(0, 0, 0, 0.2)
--shadow-lg: 0 0.5rem 2rem rgba(0, 0, 0, 0.3)

--text-shadow: 0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.8)
--text-shadow-lg: 0.25rem 0.25rem 0.5rem rgba(0, 0, 0, 0.9)
```

### Component Classes

#### Glass Effects

```html
<div class="glass">Content with light glass effect</div>
<div class="glass-dark">Content with dark glass effect</div>
```

#### Chip

```html
<div class="chip">
  <span>Monday, 8 December</span>
  <span>☀️ 10°</span>
</div>
```

#### Card

```html
<div class="card card--glass-dark">
  <h1>Your Content</h1>
</div>
```

### Using Design Tokens in Your CSS

```css
.my-clock {
  font-size: var(--text-display-1);
  font-family: var(--font-mono);
  color: var(--text-primary);
  text-shadow: var(--text-shadow-lg);
}
```

## Edge Apps Scripts CLI

This package provides the `edge-apps-scripts` CLI tool for running shared development commands across all Edge Apps.

### Creating a New App

```bash
bun run create-app
# or
bun edge-apps/edge-apps-library/bin/edge-apps-scripts.ts create
```

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

## Development

```bash
bun install      # Install dependencies
bun test         # Run tests
bun run build    # Build library
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
  ReferenceResolution,
  AutoScalerOptions,
  EdgeAppConfig,
} from '@screenly/edge-apps'
```

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

## Example: Complete Clock App

```html
<!-- clock/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Clock - Screenly Edge App</title>
</head>
<body class="m-0 p-0 overflow-hidden text-white">
  <auto-scaler reference-width="1920" reference-height="1080" orientation="auto">
    <div id="app" class="w-full h-full">
      <app-header show-date></app-header>
      <main>
        <div class="clock-container">
          <h2 data-location>London</h2>
          <div class="clock-time" data-time>12:00</div>
          <div class="clock-date" data-date>Monday, 8 January</div>
        </div>
      </main>
    </div>
  </auto-scaler>
  <edge-app-devtools reference-width="1920" reference-height="1080"></edge-app-devtools>
  
  <script src="screenly.js?version=1"></script>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

```typescript
// clock/src/main.ts
import {
  getMetadata,
  getTimeZone,
  getLocale,
  formatTime,
  formatLocalizedDate,
  signalReady,
} from '@screenly/edge-apps'
import '@screenly/edge-apps/components' // Register web components
import '@screenly/edge-apps/styles'
import './styles.css'

// Note: Auto-scaling and dev tools are handled declaratively in index.html

// Get DOM elements
const locationEl = document.querySelector('[data-location]')
const timeEl = document.querySelector('[data-time]')
const dateEl = document.querySelector('[data-date]')

// Get metadata
const metadata = getMetadata()
const [latitude, longitude] = metadata.coordinates

// Get timezone and locale
const timezone = await getTimeZone()
const locale = await getLocale()

// Update time every second
function updateTime() {
  const now = new Date()
  const timeData = formatTime(now, locale, timezone)
  const dateStr = formatLocalizedDate(now, locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  
  // Update DOM elements
  if (timeEl) {
    timeEl.textContent = timeData.formatted
  }
  if (dateEl) {
    dateEl.textContent = dateStr
  }
}

setInterval(updateTime, 1000)
updateTime()

// Signal ready
signalReady()
```

## License

MIT
