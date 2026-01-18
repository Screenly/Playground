# {{APP_TITLE}}

{{APP_DESCRIPTION}}

## Development

```bash
# Install dependencies
bun install

# Start dev server with hot reload
bun run dev
```

Open http://localhost:5173 in your browser.

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
{{APP_NAME}}/
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

