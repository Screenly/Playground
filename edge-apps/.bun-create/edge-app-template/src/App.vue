<script setup lang="ts">
import { onBeforeMount, onMounted, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings-store'

const settingsStore = useSettingsStore()
const message = ref('Get Started')

settingsStore.setupTheme()

onBeforeMount(() => {
  settingsStore.setupTheme()
})

onMounted(() => {
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container main-container-grid">
    <div class="primary-container">
      <div class="primary-card">
        <h1>{{ message }}</h1>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@mixin header-text($multiplier: 1) {
  font-size: 3.5rem * $multiplier;
}

.primary-container {
  width: 100%;
  height: 100%;
}

.primary-card {
  width: 100%;
  height: 100%;

  @media (min-width: 800px) and (min-height: 480px) and (orientation: landscape) {
    @include header-text(1);
  }

  @media (min-width: 1280px) and (min-height: 720px) and (orientation: landscape) {
    @include header-text(1.5);
  }

  @media (min-width: 1920px) and (min-height: 1080px) and (orientation: landscape) {
    @include header-text(2.25);
  }

  @media (min-width: 3840px) and (orientation: landscape) {
    @include header-text(4.5);
  }

  @media (min-width: 480px) and (min-height: 800px) and (orientation: portrait) {
    @include header-text(1);
  }

  @media (min-width: 720px) and (min-height: 1280px) and (orientation: portrait) {
    @include header-text(1);
  }

  @media (min-width: 1080px) and (min-height: 1920px) and (orientation: portrait) {
    @include header-text(1.2);
  }

  @media (min-width: 2160px) and (orientation: portrait) {
    @include header-text(2.4);
  }
}
</style>
