# {{APP_TITLE}}

A Screenly Edge App built with TypeScript and the `@screenly/edge-apps` library.

## Getting Started

### Development

```bash
bun install
bun run dev
```

The dev server will start and you can preview the app in your browser.

### Building

```bash
bun run build
```

### Linting

```bash
bun run lint
```

### Screenshots

```bash
bun run screenshots
```

## Configuration

### App ID

Add an `id` field to `screenly.yml` and `screenly_qc.yml` before deploying.

### Settings

Add your app's settings to `screenly.yml` under the `settings` key. See the
[Screenly Edge Apps documentation](https://developer.screenly.io/edge-apps/) for supported
setting types.

## Deployment

```bash
bun run deploy
```

This builds the app and deploys it to Screenly using the `screenly` CLI.

## Resources

- [Screenly Edge Apps Documentation](https://developer.screenly.io/edge-apps/)
- [Edge Apps Library](https://github.com/Screenly/Playground/tree/master/edge-apps/edge-apps-library)
- [Screenly Developer Portal](https://developer.screenly.io/)
