# The Playground TypeScript Library

The Playground TypeScript Library is a set of utilities that can be used to build Edge Apps alongside the [Vue](https://vuejs.org/) framework.

## Installation

```bash
bun add github:Screenly/Playground
```

## General

The library is categorized into the following sections:

1. Vite Plugins
2. Stores
3. Configs
4. Styles

### Vite Plugins

This library contains plugins that can be used in the [Vite](https://vite.dev/) config file for every Edge App written in Vue.

#### Development Server Plugin

The Development Server Plugin can be used during development to run the Edge App locally. It will automatically populate the development server with mock data, allowing the Edge App to run locally without any hassle.

Here's what your Vite config file (e.g., `vite.config.ts`) would look like:

```ts
import { defineConfig } from 'vite'
import { screenlyDevServer } from 'screenly-playground/edge-apps/vite-plugins'

export default defineConfig({
  // ...
  plugins: [
    screenlyDevServer()
  ],
  // ...
})
```

### Stores

This library also contains utilities that can be used to create [Pinia](https://pinia.vuejs.org/) stores.

Edge Apps heavily rely on Screenly metadata and settings. The library contains utilities for creating stores, preventing the need to write the same code repeatedly.

You can use the `settingsStoreSetup` function and pass it to the `defineStore` function to create a store.

```ts
import { defineStore } from 'pinia'
import { settingsStoreSetup, type SettingsStore } from 'screenly-playground/edge-apps/stores'

const useSettingsStore = defineStore('settings', settingsStoreSetup)

const settingsStore: SettingsStore = useSettingsStore()
settingsStore.setupTheme()
```

### Configs

Edge Apps created from the template use [Playwright](https://playwright.dev/) to run end-to-end tests. The library contains a config file for Playwright.

Here's what your `playwright.config.ts` file would look like:

```ts
import { defineConfig, type PlaywrightTestConfig } from '@playwright/test'
import { playwrightConfig } from 'screenly-playground/edge-apps/configs'

// ...
export default defineConfig(playwrightConfig as PlaywrightTestConfig)
```

### Styles

You can use `scss/base.scss` as a base stylesheet for your Edge App.

```scss
@use 'screenly-playground/edge-apps/scss/base.scss' as *;
```
