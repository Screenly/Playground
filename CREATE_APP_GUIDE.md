# Creating New Edge Apps - Simple Guide

## Quick Start

```bash
# From the Playground directory
node create-edge-app.js

# Answer the prompts
App name: my-dashboard
Description: My Dashboard Edge App

# Navigate and start
cd edge-apps/my-dashboard
bun install
bun run dev
```

That's it! 🎉

---

## What You Get

### Project Structure
```
my-dashboard/
├── src/
│   ├── main.ts              # Your app code
│   └── styles.css           # Tailwind CSS
├── index.html               # HTML template
├── screenly.yml             # Screenly manifest
├── package.json             # Dependencies
├── vite.config.ts           # Build config
├── tailwind.config.js       # Tailwind config
└── tsconfig.json            # TypeScript config
```

### Features Included
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Vite (hot reload)
- ✅ @screenly/edge-apps library
  - Auto-scaling (1920×1080 → any screen)
  - Safe zones (prevents TV overscan)
  - Dev tools overlay (press `D`)
  - Theme integration
  - Settings & metadata access

---

## Development Workflow

### 1. Install Dependencies
```bash
cd edge-apps/my-dashboard
bun install
```

### 2. Start Dev Server
```bash
bun run dev
```

Opens at `http://localhost:5173` with hot reload.

### 3. Edit Your App

**`src/main.ts`:**
```typescript
import {
  initEdgeApp,
  setupTheme,
  getSettings,
  signalReady,
} from '@screenly/edge-apps'

// Auto-scaling + safe zones
initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  safeZone: { all: '5%' }
})

setupTheme()

// Your code here
document.getElementById('app').innerHTML = `
  <h1>Hello World</h1>
`

signalReady()
```

### 4. Build for Production
```bash
bun run build
```

### 5. Deploy
```bash
bun run deploy
```

---

## Using the Library

### Import What You Need
```typescript
import {
  // UI/Layout
  initEdgeApp,
  AutoScaler,
  SafeZones,
  // Platform
  setupTheme,
  getSettings,
  getMetadata,
  signalReady,
  // Locale/Time
  getLocale,
  getTimeZone,
  formatTime,
} from '@screenly/edge-apps'
```

### Auto-Scaling
```typescript
// Initialize with auto-scaling
const { scaler } = initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  orientation: 'auto', // landscape, portrait, or auto
})

// Get current scale factor
console.log('Scale:', scaler.getScale())
```

### Safe Zones
```typescript
// Prevent TV overscan cropping
initEdgeApp('app', {
  safeZone: { 
    all: '5%'  // Same on all sides
    // Or per-side:
    // top: '10%', bottom: '10%', left: '5%', right: '5%'
  }
})
```

### Dev Tools
```typescript
// Enable development overlay
initEdgeApp('app', {
  enableDevTools: true  // Press 'D' to toggle
})
```

### Theme Colors
```typescript
import { setupTheme } from '@screenly/edge-apps'

// Applies Screenly branding colors
setupTheme()

// CSS variables are now available:
// var(--theme-color-primary)
// var(--theme-color-secondary)
```

### Settings
```typescript
import { getSettings, getSetting } from '@screenly/edge-apps'

// Get all settings
const settings = getSettings()

// Get specific setting
const apiKey = getSetting<string>('api_key')
```

### Metadata
```typescript
import { 
  getMetadata, 
  getScreenName, 
  getLocation 
} from '@screenly/edge-apps'

console.log('Screen:', getScreenName())
console.log('Location:', getLocation())
```

---

## Adding Settings

Edit `screenly.yml`:

```yaml
settings:
  api_key:
    type: string
    title: API Key
    optional: false
    help_text: Your API key
  
  refresh_interval:
    type: string
    title: Refresh Interval (seconds)
    optional: true
    default: "60"
    help_text:
      schema_version: 1
      properties:
        help_text: How often to refresh
        type: number
```

Access in code:

```typescript
import { getSetting, getSettingWithDefault } from '@screenly/edge-apps'

const apiKey = getSetting<string>('api_key')
const interval = getSettingWithDefault<number>('refresh_interval', 60)
```

---

## Example: Weather Dashboard

```typescript
import {
  initEdgeApp,
  setupTheme,
  getSetting,
  signalReady,
} from '@screenly/edge-apps'

initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  safeZone: { all: '5%' }
})

setupTheme()

async function fetchWeather() {
  const apiKey = getSetting<string>('api_key')
  const city = getSetting<string>('city')
  
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
  )
  return await response.json()
}

async function display() {
  const weather = await fetchWeather()
  
  document.getElementById('app').innerHTML = `
    <div class="container mx-auto p-8">
      <h1 class="text-6xl font-bold text-primary">
        ${weather.name}
      </h1>
      <div class="text-4xl mt-4">
        ${Math.round(weather.main.temp - 273.15)}°C
      </div>
    </div>
  `
  
  signalReady()
}

display()
setInterval(display, 10 * 60 * 1000) // Refresh every 10 min
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start dev server with hot reload |
| `bun run build` | Build for production |
| `bun run deploy` | Deploy to Screenly |
| `bun run lint` | Lint TypeScript |
| `bun run format` | Format code with Prettier |

---

## Troubleshooting

### Library not found
```bash
# Rebuild the library
cd edge-apps/edge-apps-library
bun run build

# Reinstall in your app
cd ../your-app
bun install
```

### Dev tools not showing
Press `D` key or check `enableDevTools: true` in `initEdgeApp()`

### Content not scaling
Ensure your content is inside `<div id="app"></div>`

---

## Next Steps

- 📖 Read the [library README](edge-apps/edge-apps-library/README.md)
- 🔍 Check [existing apps](edge-apps/) for examples
- 📚 Review [Edge Apps docs](https://developer.screenly.io/edge-apps)

---

*Simple. No magic. Just copy and build.* ✨

