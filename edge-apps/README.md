# Edge Apps

This directory contains all Screenly Edge Apps in this repository.

## Creating a New Edge App

From this directory, run:

```bash
bun create edge-app-template --no-git <your-app-name>
```

For example:

```bash
bun create edge-app-template --no-git my-new-app
```

This scaffolds a new app under `edge-apps/<your-app-name>/` with TypeScript, the Screenly design system, manifest files, screenshot tests, and all standard scripts pre-configured.

After scaffolding:

1. Add an `id` field to `screenly.yml` and `screenly_qc.yml`.

2. Install dependencies and start the dev server:
   ```bash
   bun install
   bun run dev
   ```

## TypeScript Library

The [`edge-apps-library`](edge-apps-library/README.md) contains shared utilities, components, and styles used by the apps in this directory.
