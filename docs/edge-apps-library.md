# Edge Apps Library

This shared library contains a set of utilities that can be used to build Edge Apps alongside the [Vue](https://vuejs.org/) framework.

## Installation

```bash
bun add github:Screenly/Playground
```

## General

The library is categorized into the following sections:

1. Reusable Components
2. Styles
3. Stores

### Reusable components

This library contains reusable Vue components that can be used to build Edge Apps.
These components are designed to be used for Edge Apps generated from the template.

The single-file components (SFCs) are located inside [`edge-apps/blueprint/ts/components`](/edge-apps/blueprint/ts/components).

#### Usage

```vue
<script setup lang="ts">
import { PrimaryCard } from 'blueprint/components'
</script>

<template>
  <PrimaryCard>
    <h1>Hello, World!</h1>
  </PrimaryCard>
</template>
```

#### Contributing

It you want to create a reusable component, you can create a new SFC inside the [`edge-apps/blueprint/ts/components`](/edge-apps/blueprint/ts/components) directory. Create subdirectories if needed.

The component should be named `[ComponentName].vue` and should be exported as `[ComponentName]`.

```vue
<script setup lang="ts">
// Include your business logic here
</script>

<template>
  <!-- Include your template here -->
</template>
```

Don't forget to add the following to the [`edge-apps/blueprint/ts/components/index.ts`](/edge-apps/blueprint/ts/components/index.ts) file:

```ts
// ...
export * from './[ComponentName]'
// ...
```

### Styles

You can use [`scss/base.scss`](/edge-apps/blueprint/scss/base.scss) as a base stylesheet for your Edge App.

```scss
@use 'blueprint/scss/base.scss' as *;
```

### Stores

This library also contains utilities that can be used to create [Pinia](https://pinia.vuejs.org/) stores.

> [!NOTE]
> While it's possible to define local reactive states inside a component using `ref` or `reactive`, it's recommended to use a central store like Pinia to manage the state that is shared across all the components. This prevents the need to manage state in multiple places and do prop drilling.

Edge Apps heavily rely on Screenly metadata and settings. The library contains utilities for creating stores, preventing the need to write the same code repeatedly.

#### Usage

You can use the `baseSettingsStoreSetup` function and pass it to the `defineStore` function to create a store.

```ts
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup, type SettingsStore } from 'blueprint/stores'

const useSettingsStore = defineStore('settings', baseSettingsStoreSetup)

const settingsStore: SettingsStore = useSettingsStore()
settingsStore.setupTheme()
```

#### Contributing

You can create a new store by creating a new TypeScript file inside the [`edge-apps/blueprint/ts/stores`](/edge-apps/blueprint/ts/stores) directory. Create subdirectories if needed.

The store should be named `[store-name].ts` and should be exported as `[store-name]`.

For example, create a new file called `new-store.ts` and export the store like this:

```ts
import { ref } from 'vue'

export const newStoreSetup = () => {
  const state1 = ref('')
  const state2 = ref('')
  const function1 = () => {
    // ...
  }
  const function2 = () => {
    // ...
  }

  return {
    state1,
    state2,
    function1,
    function2,
  }
}

export type NewStore = ReturnType<typeof newStoreSetup>
```

Inside your component, you can use the store like this:

```vue
<script setup lang="ts">
import { defineStore } from 'pinia'
import { newStoreSetup, type NewStore } from 'blueprint/stores'

const useNewStore = defineStore('new-store', newStoreSetup)

const newStore: NewStore = useNewStore()
</script>

<template>
  <div>
    <h1>{{ newStore.state1 }}</h1>
  </div>
</template>
```
