# Screenly Weather App

## Prerequisites

- [Bun (1.2.2+)](https://bun.sh/docs/installation)
- [Screenly Edge App CLI (v1.0.3+)](https://github.com/Screenly/cli?tab=readme-ov-file#installation)

## Getting Started

```bash
bun install
screenly edge-app create \
    --name=EDGE_APP_NAME \
    --in-place
```

## Create an Edge App Instance via CLI

```bash
screenly edge-app instance create --name=EDGE_APP_INSTANCE_NAME
```

## Development

```bash
# Install dependencies
bun install

# Start dev server with hot reload
bun run dev
```

Open <http://localhost:5173> in your browser.

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

> [!NOTE]
> The `deploy` command takes care of building the app as well.

## Using the Library

This app uses `@screenly/edge-apps` for:

- **Auto-scaling** - Content scales from 1920×1080 to any screen
- **Safe zones** - Prevents TV overscan cropping
- **Theme integration** - Automatic Screenly branding
- **Settings & Metadata** - Access to Screenly configuration

See the [library documentation](../edge-apps-library/README.md) for more details.
