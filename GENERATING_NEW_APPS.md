# Generating New Edge Apps - Step-by-Step Guide

This guide shows how to create a new Edge App using the generator with the updated `@screenly/edge-apps` library.

---

## Prerequisites

1. **Bun installed** - The project uses Bun as package manager
2. **Screenly CLI installed** (optional) - For running/deploying apps
3. **In the Playground directory** - All commands run from the root

---

## Step 1: Ensure the Library is Built

Before generating any apps, make sure the library is built:

```bash
cd edge-apps/edge-apps-library
bun install
bun run build
cd ../..
```

**Expected output:**
```
✓ Built TypeScript definitions to dist/
```

---

## Step 2: Run the Generator

From the Playground directory:

```bash
cd edge-app-generator
node generate.js
```

---

## Step 3: Answer the Prompts

The generator will ask you several questions:

### Basic Info
```
App name (e.g., clock, dashboard): my-dashboard
```

### Reference Resolution
```
Orientation (landscape/portrait) [landscape]: landscape
Use custom resolution? (y/N) [N]: N
```

> Default resolution: 1920×1080 (landscape) or 1080×1920 (portrait)

### Safe Zones
```
Enable safe zones? (Y/n) [Y]: Y
Use default safe zone (5%)? (Y/n) [Y]: Y
```

### Development Tools
```
Enable dev tools overlay? (Y/n) [Y]: Y
```

### Example Output
```
✨ Created my-dashboard/ with:
  • Reference resolution: 1920×1080
  • Safe zones: 5% (all sides)
  • Dev tools: Enabled
  • Framework copied ✓
  • Dependencies configured ✓

Next steps:
  cd ../edge-apps/my-dashboard
  bun install
  bun run dev
```

---

## Step 4: Navigate to Your New App

```bash
cd ../edge-apps/my-dashboard
```

Your app structure should look like:

```
my-dashboard/
├── src/
│   └── main.ts              # Your app entry point
├── index.html               # App HTML
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite build config
├── tailwind.config.js       # Tailwind config
├── screenly.yml             # Screenly manifest
└── static/
    ├── css/
    └── js/
```

---

## Step 5: Install Dependencies

```bash
bun install
```

This will:
- Install all npm dependencies
- Link `@screenly/edge-apps` from `workspace:../edge-apps-library`
- Set up Tailwind, Vite, TypeScript

---

## Step 6: Start Development Server

```bash
bun run dev
```

**What happens:**
1. Generates mock `screenly.js` with test data
2. Starts Vite dev server with hot reload
3. Watches TypeScript files for changes
4. Opens dev tools overlay (press `D` to toggle)

**Expected output:**
```
  VITE v6.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## Step 7: Edit Your App

### Main Entry Point: `src/main.ts`

The generator creates this starter code:

```typescript
import { 
  initEdgeApp, 
  setupTheme, 
  getSettings, 
  signalReady 
} from '@screenly/edge-apps'
import './styles.css'

// Initialize edge app with auto-scaling
const { scaler, devTools } = initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  orientation: 'auto',
  enableDevTools: true,
  safeZone: { all: '5%' }
})

// Setup Screenly theme
setupTheme()

// Get settings from screenly.yml
const settings = getSettings()

// Your app logic here
document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app')
  if (app) {
    app.innerHTML = `
      <div class="container mx-auto p-8">
        <h1 class="text-4xl font-bold text-primary">
          My Dashboard
        </h1>
        <p class="mt-4 text-xl">
          Ready to build!
        </p>
      </div>
    `
  }
  
  // Signal that app is ready for display
  signalReady()
})
```

### Key Features Available

#### 1. Auto-Scaling
Your content automatically scales from 1920×1080 to any screen resolution:

```typescript
// Content inside #app is automatically scaled
const { scaler } = initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080
})

// Get current scale factor
console.log('Scale:', scaler.getScale())
```

#### 2. Safe Zones
Prevents content from being cut off on TVs:

```typescript
initEdgeApp('app', {
  safeZone: { 
    all: '5%'           // 5% margin on all sides
    // Or specify per-side:
    // top: '10%',
    // bottom: '10%',
    // left: '5%',
    // right: '5%'
  }
})
```

#### 3. Dev Tools Overlay
Press `D` to toggle the development overlay:
- Shows current viewport size
- Shows reference resolution
- Shows scale factor
- Shows orientation
- Visualizes safe zones

#### 4. Theme Integration
Automatically applies Screenly branding colors:

```typescript
import { setupTheme, getThemeColors } from '@screenly/edge-apps'

setupTheme()  // Applies CSS custom properties

const colors = getThemeColors()
// colors.primary, colors.secondary, etc.
```

#### 5. Settings Access
Access configuration from `screenly.yml`:

```typescript
import { getSettings, getSetting } from '@screenly/edge-apps'

const settings = getSettings()
const apiKey = getSetting<string>('api_key')
```

#### 6. Metadata Access
Get screen information:

```typescript
import { 
  getMetadata, 
  getScreenName, 
  getLocation,
  getHardware 
} from '@screenly/edge-apps'

const metadata = getMetadata()
console.log('Screen:', getScreenName())
console.log('Location:', getLocation())
console.log('Hardware:', getHardware())  // Anywhere, RaspberryPi, ScreenlyPlayerMax
```

---

## Step 8: Customize Settings

Edit `screenly.yml` to add your own settings:

```yaml
app_id: my-dashboard
entrypoint: index.html
description: My awesome dashboard

settings:
  api_key:
    type: string
    title: API Key
    optional: false
    help_text: Your API key for data access
  
  refresh_interval:
    type: string
    title: Refresh Interval (seconds)
    optional: true
    default: "60"
    help_text:
      schema_version: 1
      properties:
        help_text: How often to refresh data
        type: number
```

Access in your code:

```typescript
import { getSetting, getSettingWithDefault } from '@screenly/edge-apps'

const apiKey = getSetting<string>('api_key')
const refreshInterval = getSettingWithDefault<number>('refresh_interval', 60)
```

---

## Step 9: Build for Production

```bash
bun run build
```

**Output:**
```
dist/
├── index.html
├── static/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── main.js
└── screenly.yml
```

---

## Step 10: Deploy to Screenly

```bash
bun run deploy
```

Or manually:

```bash
screenly edge-app deploy
```

---

## Example: Building a Weather Dashboard

Here's a complete example:

### 1. Generate the app
```bash
cd edge-app-generator
node generate.js
# Name: weather-dashboard
# Orientation: landscape
# Safe zones: Yes (5%)
# Dev tools: Yes
```

### 2. Install dependencies
```bash
cd ../edge-apps/weather-dashboard
bun install
```

### 3. Add settings to `screenly.yml`
```yaml
settings:
  api_key:
    type: string
    title: OpenWeatherMap API Key
    optional: false
  
  city:
    type: string
    title: City Name
    optional: false
    default: "London"
```

### 4. Edit `src/main.ts`
```typescript
import { 
  initEdgeApp, 
  setupTheme, 
  getSetting, 
  signalReady 
} from '@screenly/edge-apps'
import './styles.css'

// Initialize with auto-scaling
initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  safeZone: { all: '5%' }
})

setupTheme()

// Fetch weather data
async function fetchWeather() {
  const apiKey = getSetting<string>('api_key')
  const city = getSetting<string>('city')
  
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  )
  const data = await response.json()
  
  return data
}

// Display weather
async function displayWeather() {
  const app = document.getElementById('app')
  if (!app) return
  
  try {
    const weather = await fetchWeather()
    
    app.innerHTML = `
      <div class="container mx-auto p-8">
        <h1 class="text-6xl font-bold text-primary">
          ${weather.name}
        </h1>
        <div class="mt-8 text-4xl">
          ${Math.round(weather.main.temp - 273.15)}°C
        </div>
        <div class="mt-4 text-2xl text-secondary">
          ${weather.weather[0].description}
        </div>
      </div>
    `
    
    signalReady()
  } catch (error) {
    console.error('Failed to fetch weather:', error)
    app.innerHTML = '<div class="p-8 text-red-500">Failed to load weather</div>'
    signalReady()
  }
}

displayWeather()
// Refresh every 10 minutes
setInterval(displayWeather, 10 * 60 * 1000)
```

### 5. Run dev server
```bash
bun run dev
```

### 6. Build and deploy
```bash
bun run build
bun run deploy
```

---

## Troubleshooting

### Issue: Library not found

**Error:**
```
Cannot find module '@screenly/edge-apps'
```

**Solution:**
```bash
# Rebuild the library
cd ../edge-apps-library
bun run build

# Reinstall in your app
cd ../your-app
bun install
```

### Issue: Dev tools not showing

**Solution:**
Press `D` key to toggle dev tools, or ensure `enableDevTools: true` in `initEdgeApp()`

### Issue: Content not scaling

**Solution:**
Make sure your content is inside the container with `id="app"` that you pass to `initEdgeApp()`

### Issue: Safe zones not working

**Solution:**
```typescript
// Make sure safe zone is configured
initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  safeZone: { all: '5%' }  // ← Add this
})
```

---

## Available Scripts

In any generated app:

```bash
bun run dev          # Start dev server with hot reload
bun run build        # Build for production
bun run deploy       # Deploy to Screenly
bun run lint         # Lint TypeScript code
bun run format       # Format code with Prettier
bun test             # Run tests (if configured)
```

---

## Next Steps

- Read the [Edge Apps documentation](https://developer.screenly.io/edge-apps)
- Explore the `@screenly/edge-apps` [README](../edge-apps/edge-apps-library/README.md)
- Check out example apps in `edge-apps/` directory
- Review [ABSTRACTION_OPPORTUNITIES.md](../edge-apps/edge-apps-library/ABSTRACTION_OPPORTUNITIES.md) for advanced patterns

---

## Quick Reference

### Import Everything You Need
```typescript
import { 
  // UI/Layout
  initEdgeApp, AutoScaler, SafeZones,
  // Platform
  setupTheme, getSettings, getMetadata, signalReady,
  // Locale/Time
  getLocale, getTimeZone, formatTime,
  // Types
  type AutoScalerOptions, type SafeZoneConfig
} from '@screenly/edge-apps'
```

### Minimal App Template
```typescript
import { initEdgeApp, setupTheme, signalReady } from '@screenly/edge-apps'

initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080
})

setupTheme()

// Your code here

signalReady()
```

---

*Last updated: 2025-01-06*

