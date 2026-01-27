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

```plaintext
edge-apps/[new-edge-app]
├── bun.lock
├── index.html
├── package.json
├── README.md
├── screenly_qc.yml
├── screenly.yml
├── src
│   ├── css
│   │   └── style.css
│   ├── main.test.ts
│   └── main.ts
└── static
    └── img
        └── icon.svg
```

The aforementioned Edge Apps heavily rely on the Edge Apps library, which lives inside the `edge-apps/edge-apps-library/` directory.

- Most of the scripts inside the `package.json` of each of these apps execute the `edge-apps-scripts` command.
- All of these apps depend on the `@screenly/edge-apps` library, which maps to `workspace:../edge-apps-library`.
- `edge-apps/[new-edge-app]/src/main.ts` is a required file.
  - Running `bun run build` inside `edge-apps/[new-edge-app]` will run `edge-apps-scripts build`, which is very opinionated.

### Creating the Manifest Files

The new app should have the following manifest files:
- `screenly.yml`
- `screenly_qc.yml`

Here's a basic example of what `screenly.yml` could look like:

```yaml
---
syntax: manifest_v1
description: The app's description goes here.
icon: The app's icon path (HTTPS URL) goes here.
author: Screenly, Inc.
ready_signal: true
settings:
  setting_1:
    type: string
    default_value: ''
    title: Setting 1
    optional: true
    help_text:
      properties:
        advanced: true
        help_text: The help text for setting 1 goes here.
        type: string # This can either be any of the following: datetime, number, select, boolean, or string
      schema_version: 1
  setting_2:
    type: secret
    default_value: ''
    title: Setting 2
    optional: true
    help_text:
      properties:
        advanced: true
        help_text: The help text for setting 2 goes here.
        type: boolean
      schema_version: 1
```

More information about the manifest files can be found in the [Edge Apps documentation in the `Screenly/cli` repository](https://raw.githubusercontent.com/Screenly/cli/refs/heads/master/docs/EdgeApps.md).

### Creating `src/main.ts`

The new app's `main.ts` should look like the following:

```typescript
import './css/style.css'
import {
  setupTheme,
  getSettingWithDefault,
  setupErrorHandling,
  signalReady,
} from '@screenly/edge-apps'

async function startApp(): Promise<void> {
  // The main logic of your Edge App goes here.

  // Signal the digital signage player that the app is ready to be displayed.
  signalReady()
}

window.onload = function () {
  const setting1 = getSettingWithDefault<string>('setting_1', 'default_value_1')
  const setting2 = getSettingWithDefault<boolean>('setting_2', false) // The `false` here serves as a fallback when the value for `setting_2` is not set or when `setting_2` is not defined.

  // Setup error handling with panic-overlay
  setupErrorHandling()

  // Setup branding colors using the library
  setupTheme()

  startApp()
}
```

### Creating `main.test.ts`

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'
import { getSettingWithDefault } from '@screenly/edge-apps'

// eslint-disable-next-line max-lines-per-function
describe('Edge App Settings', () => {
  beforeEach(() => {
    setupScreenlyMock(
      {
        location: 'Test Location',
        hostname: 'display-01',
      },
      {
        setting_1: 'test_value',
        setting_2: 'true',
      },
    )
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  // eslint-disable-next-line max-lines-per-function
  test('should retrieve settings with correct values', () => {
    const setting1 = getSettingWithDefault<string>('setting_1', 'default_value_1')
    const setting2 = getSettingWithDefault<boolean>('setting_2', false)

    expect(setting1).toBe('test_value')
    expect(setting2).toBe(true)
  })
})
```

### Creating `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Edge App Title</title>
    <script src="screenly.js?version=1"></script>
    <link rel="stylesheet" href="dist/css/style.css" />
  </head>
  <body>
    <!-- The main HTML structure of your Edge App goes here. -->
    <script src="dist/js/main.js"></script>
  </body>
</html>
```

### Creating `style.css`

```css
@import 'tailwindcss';

/* Add your custom styles here */
/* You can create other CSS files inside `src/css/` and import them here if needed. */
```
