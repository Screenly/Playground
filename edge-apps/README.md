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

## Linting and Formatting

### Apps with a build system

From the app directory, run:

```bash
bun run lint
bun run format:check
```

### Apps without a build system

From the repository root, run the following tools via `bunx`:

```bash
# Formatting (HTML, CSS, JS, JSON, YAML, Markdown)
bunx prettier --check --config edge-apps/.prettierrc.json "edge-apps/<app-name>/**/*.{html,css,js,json,yml,yaml}"

# Markdown
bunx markdownlint-cli2 "edge-apps/<app-name>/**/*.md"

# HTML
bunx htmlhint "edge-apps/<app-name>/index.html"

# CSS (excludes dist/)
bunx stylelint --config edge-apps/.stylelintrc.json "edge-apps/<app-name>/**/*.css"

# JavaScript (excludes dist/ and minified files)
bunx eslint "edge-apps/<app-name>/path/to/file.js"
```

## TypeScript Library

The [`@screenly/edge-apps`](https://www.npmjs.com/package/@screenly/edge-apps) NPM package contains shared utilities, components, and styles used by the apps in this directory.
