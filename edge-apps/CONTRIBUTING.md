# Contributing to Screenly Edge Apps

## Prerequisites

### Bun

All Edge Apps with a build tool use [Bun](https://bun.sh/) as the package manager and runtime. Install it via:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Playwright (for screenshot generation)

Apps that support automated screenshots require Playwright's Chromium browser. Run these **one-time** setup commands:

```bash
npx playwright install
sudo npx playwright install-deps
```

> [!NOTE]
> `playwright install-deps` installs system-level dependencies required by Chromium and may require `sudo`.

## Generating Screenshots

Apps with screenshot support expose a `bun run screenshots` command. Screenshots must be generated and committed before opening a pull request.

To generate screenshots for an app:

```bash
cd edge-apps/<app-name>
bun run screenshots
```

This builds the app, starts a local preview server, captures screenshots at all supported Screenly resolutions, and saves them as WebP files in `<app-name>/screenshots/`.

### Supported Resolutions

| Width | Height | Orientation |
| ----- | ------ | ----------- |
| 4096  | 2160   | Landscape   |
| 2160  | 4096   | Portrait    |
| 3840  | 2160   | Landscape   |
| 2160  | 3840   | Portrait    |
| 1920  | 1080   | Landscape   |
| 1080  | 1920   | Portrait    |
| 1280  | 720    | Landscape   |
| 720   | 1280   | Portrait    |
| 800   | 480    | Landscape   |
| 480   | 800    | Portrait    |

### Apps with Screenshot Support

- `cap-alerting`
- `clock`
- `menu-board`
- `qr-code`
- `simple-timer`
- `weather`

## Development Workflow

1. Install dependencies: `bun install`
2. Start the development server: `bun run dev`
3. Make your changes
4. Run linting: `bun run lint`
5. Run unit tests: `bun run test:unit`
6. Build the app: `bun run build`
7. Generate and commit screenshots: `bun run screenshots`
8. Open a pull request
