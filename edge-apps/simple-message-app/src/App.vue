<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { AnalogClock } from 'blueprint/components'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container main-container-grid">
    <!-- Primary Container with Message Head -->
    <div class="primary-container">
      <div class="primary-card message-head">
        <span class="message-head-content">Simple Message App</span>
      </div>
    </div>
    <!-- Secondary Container for message body -->
    <div class="secondary-container">
      <div class="message-body secondary-card">
        <span class="message-body-content"
          >A simple message app allows users to display text on a screen, making
          it a basic tool for digital signage. Users can input and edit both the
          heading and message body directly from the Screenly dashboard.</span
        >
      </div>
    </div>
    <!-- Row Container with modules -->
    <div class="row-container">
      <div class="secondary-card info-card">
        <img src="/static/img/icon.svg" class="brand-logo" alt="Brand Logo" />
        <span class="info-text">Powered by Screenly</span>
      </div>
      <div class="secondary-card date-card">
        <span class="date-text">MON</span>
        <span class="date-number">05</span>
      </div>
      <div class="secondary-card">
        <AnalogClock
          :style="{
            backgroundColor: '#EFEFEF',
          }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Grid Layout Styles */

.main-container-grid {
  display: grid !important;
  grid-template-rows: 2fr 0.5fr 0.125fr 0.25fr 0.125fr 0.25fr 0.5fr !important;
  grid-template-columns: 3fr 0.25fr 0.5fr 0.5fr 0.5fr !important;
  gap: 2rem !important;
  height: 100% !important;
  width: 100% !important;

  .primary-container {
    width: 100% !important;
    grid-area: 1 / 1 / 4 / 3 !important;

    .primary-card {
      width: 100% !important;
      height: 100% !important;
    }
  }

  .secondary-container {
    width: 100% !important;
    border-radius: 3rem !important;
    background-color: #fff !important;
    grid-area: 1 / 3 / 8 / 6 !important;
  }

  .row-container {
    height: 100% !important;
    grid-area: 4 / 1 / 8 / 3 !important;
    gap: 2rem !important;
    display: flex !important;
    flex-direction: row !important;
    justify-content: space-between !important;

    // Force equal width for all secondary cards
    .secondary-card {
      flex: 1 1 33.333% !important;
      max-width: 33.333% !important;
      min-width: 0 !important;
    }
  }
}

/* Message Content Styles */
.message-head-content {
  font-size: 14rem;
  padding: 10rem;
  font-weight: bold;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 4;
  height: calc(1.15em * 5);
  overflow: hidden;

  // Responsive font sizing to match legacy app
  @media screen and (max-width: 1920px) and (orientation: landscape) {
    font-size: 7rem;
    padding: 5rem;
  }

  @media screen and (max-width: 1680px) and (orientation: landscape) {
    font-size: 6rem;
    padding: 4rem;
  }

  @media screen and (max-width: 1600px) and (orientation: landscape) {
    font-size: 5.5rem;
  }

  @media screen and (max-width: 1366px) and (orientation: landscape) {
    font-size: 5rem;
  }

  @media screen and (max-width: 1280px) and (orientation: landscape) {
    font-size: 4.5rem;
    padding: 3rem;
    -webkit-line-clamp: 4;
    height: calc(1.15em * 5);
  }

  @media screen and (max-width: 1080px) and (orientation: landscape) {
    font-size: 4.5rem;
    padding: 6rem;
  }

  @media screen and (max-width: 1024px) and (orientation: landscape) {
    font-size: 3.2rem;
    padding: 3rem;
  }

  @media screen and (max-width: 800px) and (orientation: landscape) {
    font-size: 3rem;
    padding: 2.5rem;
    -webkit-line-clamp: 4;
    height: calc(1.2em * 5);
  }

  // Portrait responsive sizes
  @media screen and (max-width: 2160px) and (orientation: portrait) {
    -webkit-line-clamp: 6;
    height: calc(1.15em * 7);
  }

  @media screen and (max-width: 1080px) and (orientation: portrait) {
    font-size: 7rem;
    padding: 5rem;
  }

  @media screen and (max-width: 720px) and (orientation: portrait) {
    font-size: 4.5rem;
    padding: 4rem;
    -webkit-line-clamp: 6;
    height: calc(1.17em * 7);
  }

  @media screen and (max-width: 480px) and (orientation: portrait) {
    font-size: 3.5rem;
    padding: 2rem;
    -webkit-line-clamp: 5;
    height: calc(1.17em * 6);
  }
}

.primary-card.message-head {
  align-items: flex-start !important;
  justify-content: normal !important;
}

.message-body-content {
  font-size: 6rem;
  padding: 10rem;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 17;
  height: calc(1.14em * 20);
  overflow: hidden;

  // Responsive font sizing to match legacy app
  @media screen and (max-width: 3840px) and (orientation: landscape) {
    padding: 9rem;
  }

  @media screen and (max-width: 2560px) and (orientation: landscape) {
    font-size: 3.2rem;
    padding: 4rem;
  }

  @media screen and (max-width: 1920px) and (orientation: landscape) {
    font-size: 3rem;
    padding: 4rem;
    -webkit-line-clamp: 17;
    height: calc(1.13em * 20);
  }

  @media screen and (max-width: 1680px) and (orientation: landscape) {
    font-size: 2.5rem;
    padding: 3rem;
    -webkit-line-clamp: 18;
    height: calc(1.13em * 21);
  }

  @media screen and (max-width: 1600px) and (orientation: landscape) {
    font-size: 2.3rem;
  }

  @media screen and (max-width: 1366px) and (orientation: landscape) {
    font-size: 1.95rem;
    height: calc(1.15em * 21);
  }

  @media screen and (max-width: 1280px) and (orientation: landscape) {
    font-size: 2rem;
    padding: 2.5rem;
    -webkit-line-clamp: 17;
    height: calc(1.13em * 20);
  }

  @media screen and (max-width: 1080px) and (orientation: landscape) {
    font-size: 2rem;
    padding: 2.5rem;
  }

  @media screen and (max-width: 1024px) and (orientation: landscape) {
    font-size: 1.5rem;
    height: calc(1.16em * 20);
  }

  @media screen and (max-width: 800px) and (orientation: landscape) {
    font-size: 1.25rem;
    padding: 2.5rem;
    -webkit-line-clamp: 18;
    height: calc(1.12em * 22);
  }

  // Portrait responsive sizes
  @media screen and (max-width: 2160px) and (orientation: portrait) {
    padding: 6rem;
    -webkit-line-clamp: 9;
    height: calc(1.13em * 11);
  }

  @media screen and (max-width: 1080px) and (orientation: portrait) {
    font-size: 3rem;
    padding: 4rem;
    -webkit-line-clamp: 8;
    height: calc(1.13em * 10);
  }

  @media screen and (max-width: 720px) and (orientation: portrait) {
    font-size: 2rem;
    padding: 2.5rem;
    -webkit-line-clamp: 8;
    height: calc(1.14em * 10);
  }

  @media screen and (max-width: 480px) and (orientation: portrait) {
    font-size: 1.3rem;
    padding: 1.2rem;
    -webkit-line-clamp: 8;
    height: calc(1.23em * 9);
  }
}

.message-body {
  display: flex;
  align-items: flex-start;
  justify-content: normal;
}

/* Card Styles */
.secondary-card {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: auto !important;
  gap: 2rem !important;
  border-radius: 3.481rem !important;
  background-color: var(--theme-color-tertiary) !important;
}

.info-card {
  gap: 2rem;
}

.brand-logo {
  width: 12rem;
}

.info-text {
  font-size: 1.75rem;
  color: var(--theme-color-primary);
}

.date-card {
  gap: 0.25rem;
}

.date-text {
  font-size: 5rem;
  color: var(--theme-color-secondary);
}

.date-number {
  line-height: 1;
  font-size: 11rem;
  color: var(--theme-color-primary);
}

$base-scale: 0.2;

.clock-container {
  @media screen and (min-width: 800px) and (orientation: landscape) {
    transform: scale($base-scale);
  }

  @media screen and (min-width: 1280px) and (orientation: landscape) {
    transform: scale($base-scale * 1.5);
  }

  @media screen and (min-width: 1920px) and (orientation: landscape) {
    transform: scale($base-scale * 2.25);
  }

  @media screen and (min-width: 3840px) and (orientation: landscape) {
    transform: scale($base-scale * 4.5);
  }

  @media screen and (min-width: 480px) and (orientation: portrait) {
    transform: scale($base-scale * 1);
  }

  @media screen and (min-width: 720px) and (orientation: portrait) {
    transform: scale($base-scale * 1.6);
  }

  @media screen and (min-width: 1080px) and (orientation: portrait) {
    transform: scale($base-scale * 2.4);
  }

  @media screen and (min-width: 2160px) and (orientation: portrait) {
    transform: scale($base-scale * 4.8);
  }
}
</style>
