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
bunx prettier --check --config edge-apps/.prettierrc.json "edge-apps/<app-name>/**/*.{html,css,js,json,yml,yaml,md}"

# Markdown
bunx markdownlint-cli2 "edge-apps/<app-name>/**/*.md"

# HTML
bunx htmlhint "edge-apps/<app-name>/index.html"

# CSS (excludes dist/)
find edge-apps/<app-name> -name "*.css" -not -path "*/dist/*" -not -path "*/node_modules/*" \
  -print0 | xargs -0 -r bunx stylelint --config edge-apps/.stylelintrc.json

# JavaScript (excludes dist/ and minified files)
find edge-apps/<app-name> -name "*.js" -not -name "*.min.js" -not -name "eslint.config.js" \
  -not -path "*/dist/*" -not -path "*/node_modules/*" \
  -print0 | xargs -0 -r bunx eslint --config edge-apps/eslint.config.cjs
```

## TypeScript Library

The [`@screenly/edge-apps`](https://www.npmjs.com/package/@screenly/edge-apps) NPM package contains shared utilities, components, and styles used by the apps in this directory.
