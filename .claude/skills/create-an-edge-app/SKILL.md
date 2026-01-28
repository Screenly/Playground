---
name: create-an-edge-app
description: The recommended way to create an Edge App
---

# Creating an Edge App

## When Creating an Edge App

- Create a new directory for a new Edge App inside the `edge-apps/` directory.
  - The directory name should follow the `kebab-case` naming convention.

## Directory Structure

The new Edge Apps directory structure should closely resemble that of the following Edge Apps:

- QR Code (`edge-apps/qr-code/`)
- Menu Board (`edge-apps/menu-board/`)
- Grafana (`edge-apps/grafana/`)
- CAP Alerting (`edge-apps/cap-alerting/`)

The aforementioned Edge Apps heavily rely on the Edge Apps library, which lives inside the `edge-apps/edge-apps-library/` directory.

- Most of the scripts inside the `package.json` of each of these apps execute the `edge-apps-scripts` command.
- All of these apps depend on the `@screenly/edge-apps` library, which maps to `workspace:../edge-apps-library`.
- `edge-apps/[new-edge-app]/src/main.ts` is a required file.
  - Running `bun run build` inside `edge-apps/[new-edge-app]` will run `edge-apps-scripts build`, which is very opinionated.

Refer to `edge-apps/qr-code/` as a complete working template to understand the full directory structure and configuration.
While it still uses the `@screenly/edge-apps` library, it features a simpler implementation with a lower code footprint compared to the other aforementioned Edge Apps, making it an excellent starting point for new projects.
The library abstracts much of the complexity, allowing developers to focus on core functionality with minimal boilerplate.

### About the Manifest Files

The new app should have the following manifest files:
- `screenly.yml`
- `screenly_qc.yml`

See `edge-apps/qr-code/screenly.yml` for a working example. More information about the manifest files can be found in the [Edge Apps documentation in the `Screenly/cli` repository](https://raw.githubusercontent.com/Screenly/cli/refs/heads/master/docs/EdgeApps.md).

### About `index.html`

The `index.html` file should follow these best practices:
- Organize HTML code into templates and Web Components as the app grows in complexity
- Use HTML content templates first for simpler structures
- Consider using Web Components for more complex UI components that require encapsulation and reusability