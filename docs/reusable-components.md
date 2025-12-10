# Reusable Components

> [!WARNING]
> The Vue-based reusable components in this guide are part of the legacy `blueprint` library. These are deprecated and will be removed once all dependent apps have migrated to the new `edge-apps-library`.

Screenly's Edge App library offers a set of reusable Vue components that can be used to build Edge Apps.

If you're not yet familiar with Vue, check out the [Component Basics](https://vuejs.org/guide/essentials/component-basics.html) section of Vue's documentation.

## PrimaryCard

The `PrimaryCard` component is a simple card component that can be used to display content in a card-like format.

Go ahead and open the `App.vue` file and replace the content with the following:

```vue
<script setup lang="ts">
import { PrimaryCard } from "blueprint/components";
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

## InfoCard

The `InfoCard` is just like the `PrimaryCard` component but it only occupies half of the screen's width (in landscape mode) or height (in portrait mode).

```vue
<script setup lang="ts">
import { InfoCard } from "blueprint/components";
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
import { InfoCard } from "blueprint/components";
</script>

<template>
  <div class="main-container">
    <InfoCard
      :style="{
        padding: '5rem',
      }"
    >
      <h1 style="font-size: 7rem;">One makes you larger...</h1>
    </InfoCard>
    <InfoCard
      :style="{
        backgroundColor: '#FF3D92',
        padding: '1rem',
      }"
    >
      <h1 style="font-size: 3rem;">...and another makes you small</h1>
    </InfoCard>
  </div>
</template>
```

![info-card-02](/docs/images/components/info-card-02.png)

What's unique about the `InfoCard` component is that you can pass an `value` prop to the component.

```vue
<script setup lang="ts">
import { InfoCard } from "blueprint/components";
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
          src="https://example.com/icon.svg"
          alt="Icon"
        />
      </template>

      <h1>Hello, world!</h1>
    </InfoCard>
  </div>
</template>
```

![info-card-03](/docs/images/components/info-card-03.png)

## AnalogClock

The `AnalogClock` component is a simple clock component that can be used to display the current time.

```vue
<script setup lang="ts">
import { PrimaryCard, AnalogClock } from "blueprint/components";
</script>

<template>
  <div class="main-container">
    <PrimaryCard>
      <AnalogClock />
    </PrimaryCard>
  </div>
</template>
```

![analog-clock-01](/docs/images/components/analog-clock-01.png)

> [!NOTE]
> The `AnalogClock` defaults to the current time in the UTC timezone. In the screenshot above, the time is set to `12:00:00`.

If you want to change the timezone, you can pass a `timezone` prop to the component.
For example, if you want to display the time in the `America/Los_Angeles` timezone, you can pass `America/Los_Angeles` to the `timezone` prop.

```vue
<script setup lang="ts">
import { AnalogClock } from "blueprint/components";
</script>

<template>
  <div class="main-container">
    <PrimaryCard>
      <AnalogClock timezone="America/Los_Angeles" />
    </PrimaryCard>
  </div>
</template>
```

![analog-clock-02](/docs/images/components/analog-clock-02.png)

Take note that the time is now `05:00:00` (DST) in the screenshot above.

## BrandLogoCard

The `BrandLogoCard` component is a simple card component that can be used to display a custom logo with the text "Powered by Screenly".

You can pass a `logo-src` prop to the component to display a custom logo. Think of the component as a wrapper around the `img` tag.

Let's update the `App.vue` file with the following content:

```vue
<script setup lang="ts">
import { InfoCard, BrandLogoCard } from "blueprint/components";
import logoSrc from "@/assets/images/screenly.svg";
</script>

<template>
  <div class="main-container">
    <InfoCard>
      <h1
        :style="{
          fontSize: '5rem',
        }"
      >
        Hello, world!
      </h1>
    </InfoCard>
    <BrandLogoCard
      :style="{
        backgroundColor: '#FFFFFF',
      }"
      :logo-src="logoSrc"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.brand-logo-card) {
  .info-text {
    color: var(--theme-color-primary);
    font-size: 2rem;
    margin-top: 1rem;
  }
}
</style>
```

![brand-logo-card-01](/docs/images/components/brand-logo-card-01.png)

## DigitalClock

The `DigitalClock` component is a simple clock component that can be used to display the current time.

```vue
<script setup lang="ts">
import { DigitalClock, PrimaryCard } from "blueprint/components";
</script>

<template>
  <div class="main-container">
    <PrimaryCard
      :style="{
        backgroundColor: '#FFFFFF',
      }"
    >
      <DigitalClock />
    </PrimaryCard>
  </div>
</template>
```

![digital-clock-01](/docs/images/components/digital-clock-01.png)

> [!NOTE]
> The `DigitalClock` defaults to the current time in the UTC timezone. The local defaults to `en`.

You can also pass a `timezone` and a `locale` prop to the component.

```vue
<script setup lang="ts">
import { DigitalClock, PrimaryCard } from "blueprint/components";
</script>

<template>
  <div class="main-container">
    <PrimaryCard
      :style="{
        backgroundColor: '#FFFFFF',
      }"
    >
      <DigitalClock timezone="Europe/London" locale="en-GB" />
    </PrimaryCard>
  </div>
</template>
```

![digital-clock-02](/docs/images/components/digital-clock-02.png)

## DateDisplay

The `DateDisplay` component is a simple date component that can be used to display the current date and day of the week.

Here's an example that shows `DateDisplay` and `AnalogClock` side-by-side.

```vue
<script setup lang="ts">
import { DateDisplay, AnalogClock, InfoCard } from "blueprint/components";
</script>

<template>
  <div class="main-container">
    <InfoCard
      :style="{
        backgroundColor: '#FFFFFF',
      }"
    >
      <DateDisplay />
    </InfoCard>
    <InfoCard>
      <AnalogClock />
    </InfoCard>
  </div>
</template>
```

![date-display-01](/docs/images/components/date-display-01.png)

## What's next?

Now that you've learned how to use the reusable components, you can start using them or start writing your own components inside the `edge-apps/blueprint/ts/components` directory.

Feel free to check out the [source code of Vue-based Edge Apps](/edge-apps) to see how the components are used across various use cases.
