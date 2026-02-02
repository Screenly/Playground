# Weather New

Weather New Edge App

## Development

```bash
# Install dependencies
bun install

# Start dev server with hot reload
bun run dev
```

Open http://localhost:5173 in your browser.

### Dev Tools

In development mode, you'll see:

- 📐 **Safe zone overlay** (dashed lines showing the 5% padding)
- 📊 **Info panel** (viewport, resolution, scale factor)
- ⌨️ **Press "D"** to toggle the overlay on/off

**These are automatically hidden in production builds!**

## Building

```bash
# Build for production
bun run build
```

## Deployment

```bash
# Deploy to Screenly
bun run deploy
```

## Project Structure

```
weather-new/
├── src/
│   ├── main.ts         # Main entry point
│   └── styles.css      # Tailwind CSS
├── static/             # Built assets
├── index.html          # HTML template
├── screenly.yml        # Screenly manifest
└── package.json        # Dependencies
```

## Using the Library

This app uses `@screenly/edge-apps` for:

- **Auto-scaling** - Content scales from 1920×1080 to any screen
- **Safe zones** - Prevents TV overscan cropping
- **Theme integration** - Automatic Screenly branding
- **Settings & Metadata** - Access to Screenly configuration

See the [library documentation](../edge-apps-library/README.md) for more details.
