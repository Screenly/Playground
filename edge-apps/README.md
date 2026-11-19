# Edge Apps

Most Screenly Edge Apps live in their own repositories under the Screenly organization. See the [Edge Apps table](/README.md#edge-apps) in the root README for the full list.

This directory contains:

- [`icons/`](icons): Shared icons for the apps in their own repositories. Their manifests point `icon` to `https://playground.srly.io/edge-apps/icons/<icon>.svg`.
- [`helpers/`](helpers): Hosted tools and assets that apps link to, such as the [TfL bus stop lookup](helpers/tfl/bus-stop-lookup) and the RSS Reader [news icons](helpers/rss-reader/app-icons).
- Apps that haven't moved to their own repository yet. Their manifests reference their own assets, not `icons/`:
  - [`instagram`](instagram)
  - [`queue-management-system`](queue-management-system)
  - [`sonar-dashboard`](sonar-dashboard)
- [`welcome-app/`](welcome-app): Only the legacy icon, still used by the published Welcome app's manifest. Remove it once [Screenly/welcome-app#23](https://github.com/Screenly/welcome-app/pull/23) is released.

## Creating a New Edge App

New Edge Apps should be created in their own standalone GitHub repo under the Screenly org rather than in this directory. If you're a maintainer, start from one of the existing standalone apps (see the reference apps listed in the [`create-an-edge-app` skill](/.claude/skills/create-an-edge-app/SKILL.md)) that's closest in complexity to what you're building, and adapt it.

To add the app's icon, put an SVG in [`icons/`](icons) and point the `icon` field in the app's `screenly.yml` and `screenly_qc.yml` to `https://playground.srly.io/edge-apps/icons/<icon>.svg`.

## Linting and Formatting

The apps in this directory don't have a build system. From the repository root, run the following tools via `bunx`:

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

The [`@screenly/edge-apps`](https://www.npmjs.com/package/@screenly/edge-apps) NPM package contains shared utilities, components, and styles for building Edge Apps.
