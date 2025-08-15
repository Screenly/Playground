# Reusable Components

Screenly's Edge App library offers a set of reusable Vue components that can be used to build Edge Apps.

If you're not yet familiar with Vue, check out the [Component Basics](https://vuejs.org/guide/essentials/component-basics.html) section of Vue's documentation.

This guide assumes that you created a new Edge App using the [template](/README.md#creating-a-new-edge-app-from-the-template).

## PrimaryCard

The `PrimaryCard` component is a simple card component that can be used to display content in a card-like format.

Go ahead and open the `App.vue` file and replace the content with the following:

```vue
<script setup lang="ts">
import { PrimaryCard } from 'blueprint/components'
</script>

<template>
  <div class="main-container">
    <PrimaryCard></PrimaryCard>
  </div>
</template>

<style scoped lang="scss"></style>
```

The default background color of the `PrimaryCard` component is `#972EFF`.

![primary-card-01](/docs/images/components/primary-card-01.png)

Adding a text inside the `PrimaryCard` component will align the text to the center of the card.

```vue
<template>
  <div class="main-container">
    <PrimaryCard>
      <h1>Hello, world!</h1>
    </PrimaryCard>
  </div>
</template>

<style scoped lang="scss">
h1 {
  font-size: 5rem;
}
</style>
```

![primary-card-02](/docs/images/components/primary-card-02.png)

You can also override the default background color of the `PrimaryCard` component by passing a `bg-color` prop to the component.

```vue
<template>
  <div class="main-container">
    <PrimaryCard
      :style="{
        backgroundColor: '#FF3D92',
      }"
    >
      <h1>Hello, world!</h1>
    </PrimaryCard>
  </div>
</template>
```

![primary-card-03](/docs/images/components/primary-card-03.png)
