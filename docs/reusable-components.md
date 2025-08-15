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

> [!NOTE]
> You need to wrap the `PrimaryCard` component in a `div` with the class `main-container` to ensure that the card is inside a gray-colored container that occupies the entire screen.

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

> [!NOTE]
> You can either use `camelCase` or `kebab-case` when defining inline styles.
> If you're using `kebab-case`, you need to wrap the value in single quotes.

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

### InfoCard

The `InfoCard` is just like the `PrimaryCard` component but it only occupies half of the screen's width (in landscape mode) or height (in portrait mode).

```vue
<script setup lang="ts">
import { InfoCard } from 'blueprint/components'
</script>

<template>
  <div class="main-container">
    <InfoCard>
      <h1 style="font-size: 5rem;">Hello, world!</h1>
    </InfoCard>
  </div>
</template>

<style scoped lang="scss"></style>
```

![info-card-01](/docs/images/components/info-card-01.png)

You can also add another `InfoCard` component so that it sits side-by-side with the first one.

```vue
<script setup lang="ts">
import { InfoCard } from 'blueprint/components'
</script>

<template>
  <div class="main-container">
    <InfoCard
      :style="{
        padding: '5rem',
      }"
    >
      <h1 style="font-size: 7rem;">
        One makes you larger...
      </h1>
    </InfoCard>
    <InfoCard
      :style="{
        backgroundColor: '#FF3D92',
        padding: '1rem',
      }"
    >
      <h1 style="font-size: 3rem;">
        ...and another makes you small
      </h1>
    </InfoCard>
  </div>
</template>
```

![info-card-02](/docs/images/components/info-card-02.png)

What's unique about the `InfoCard` component is that you can pass an `value` prop to the component.

```vue
<script setup lang="ts">
import { InfoCard } from 'blueprint/components'
</script>

<template>
  <div class="main-container">
    <InfoCard
      :style="{
        backgroundColor: '#FFFFFF',
        color: '#972EFF',
        width: '100%',
      }"
      value="1.0.0"
      title="Version"
    >
      <template #icon>
        <img
          :style="{
            width: '10rem',
            height: '10rem',
          }"
          src="https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/edge-apps/.bun-create/edge-app-template/static/images/icon.svg"
          alt="Icon"
        />
      </template>

      <h1>Hello, world!</h1>
    </InfoCard>
  </div>
</template>
```

![info-card-03](/docs/images/components/info-card-03.png)
