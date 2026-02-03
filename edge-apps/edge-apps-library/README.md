# Edge Apps Library

## Overview

`@screenly/edge-apps` is a TypeScript library and tooling set for building Screenly Edge Apps. It provides:

- **Runtime helpers** for working with Edge Apps metadata, settings, themes, locales, time formatting, and screen information.
- **UI components** (header, brand logo, dev tools, auto-scaler) to quickly scaffold consistent, production-ready apps.
- **A template app** and **CLI scripts** to generate new Edge Apps with a batteries‑included setup.

Use this package when you want to build modern, Vite-based Edge Apps that follow Screenly’s best practices out of the box.

## How is it structured?

At a high level:

- **`src/`**: Source for the library itself.
  - **`src/components/`**: Reusable UI components (`app-header`, `brand-logo`, `dev-tools`, `auto-scaler`, and registry utilities).
  - **`src/core/`**: Core entry points for Edge Apps runtime helpers. This is there for backward compatibility.
  - **`src/styles/`**: Base styles and design tokens (fonts, colors, spacing, typography, etc.).
  - **`src/utils/`**: Utility functions for locale, time/date formatting, metadata, screen data, settings, theme, UTM, and weather.
  - **`src/types/`**: Shared TypeScript types.
  - **`src/test/`**: Test helpers and JSDOM setup for unit tests.
- **`template/`**: A minimal Edge App template (Vite + TypeScript + Tailwind CSS) used as the starting point when creating new apps.
- **`scripts/`**: CLI helpers (`cli.ts`, `create.ts`) used to generate apps from the template.
- **`bin/edge-apps-scripts.ts`**: The published CLI entry point (wired via the `edge-apps-scripts` binary in `package.json`).

## How to create a new Edge App

The recommended way to create a new Edge App is to use the template and scripts provided by this package.

1. **Install dependencies** from the Playground repo root (this will install the library and workspace apps):

   ```bash
   bun install
   ```

2. **Run the create script** from the Playground repo root to scaffold a new app:

   ```bash
   bun run create-app
   ```

   The script will:
   - Ask for basic information (app name, ID, description, etc.).
   - Copy the contents of `template/` into a new directory.
   - Update the new app’s `screenly.yml`, `package.json`, and basic branding.

3. **Open the generated app** and update:
   - `screenly.yml` to fine‑tune settings and metadata.
   - `src/main.ts` and `src/styles.css` for your custom logic and styles.
   - `assets/` for app-specific images and icons.

You can also manually copy the `template/` directory to bootstrap an app, but using the CLI keeps things consistent and less error‑prone.

## Basic scripts of the generated app

A newly generated app (from `template/`) ships with standard Vite + Bun scripts in its `package.json` (run from inside the new app directory):

- **`bun dev`**: Start the development server with hot reloading.
- **`bun build`**: Create a production build of the app.
- **`bun preview`**: Serve the built app locally to verify the production build.
- **`bun test`** (if configured): Run unit tests for the app.
- **`bun lint` / `bun format`** (if present): Lint and format source files.

These scripts are typically exposed as:

```bash
bun dev
bun build
bun preview
```

Refer to the generated app’s `package.json` for the exact script names if they change.

## How to use other things from the library

Once you have an Edge App created from the template, you can import helpers, styles, and components from `@screenly/edge-apps` to avoid re‑implementing common logic:

- **Styles**

  ```ts
  // main.ts or entry file
  import '@screenly/edge-apps/styles'
  ```

- **Components**

  ```ts
  import { registerComponents } from '@screenly/edge-apps/components'

  registerComponents()
  ```

- **Runtime helpers & utilities**

  ```ts
  import { getSettings, getMetadata } from '@screenly/edge-apps/utils'

  const settings = getSettings()
  const metadata = getMetadata()
  ```

In most cases, you will:

- Use the **template** to get a working Edge App.
- Import **styles** and **components** to match Screenly's look and feel.
- Use **utils** and **types** to work with Edge Apps metadata, settings, and screen information in a type‑safe way.

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
  <auto-scaler
    reference-width="1920"
    reference-height="1080"
    orientation="auto"
  >
    <div id="app">
      <app-header show-date></app-header>
      <main>
        <!-- Your app content -->
      </main>
    </div>
  </auto-scaler>
  <edge-app-devtools
    reference-width="1920"
    reference-height="1080"
  ></edge-app-devtools>

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
import {
  getWeatherIconKey,
  getWeatherIconUrl,
  getTimeZone,
} from '@screenly/edge-apps'

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
<auto-scaler
  reference-width="1920"
  reference-height="1080"
  orientation="auto"
  center-content
>
  <div id="app">
    <!-- Your content -->
  </div>
</auto-scaler>
```

### `<edge-app-devtools>`

Development overlay showing viewport, reference resolution, and scale. Only visible in development mode.

**Usage:**

```html
<edge-app-devtools
  reference-width="1920"
  reference-height="1080"
></edge-app-devtools>
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
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
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
