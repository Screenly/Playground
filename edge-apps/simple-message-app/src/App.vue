<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import {
  PrimaryCard,
  AnalogClock,
} from 'blueprint/components'

const useScreenlyMetadataStore = defineStore('metadata', metadataStoreSetup)
const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const screenlyMetadataStore = useScreenlyMetadataStore()
const baseSettingsStore = useBaseSettingsStore()

const { hostname, screenName, hardware, coordinates, location } = storeToRefs(
  screenlyMetadataStore,
) as unknown as {
  hostname: Ref<string>
  screenName: Ref<string>
  hardware: Ref<string>
  coordinates: Ref<[number, number]>
  location: Ref<string>
}

const secretWord = ref(screenly.settings.secret_word)
const greeting = ref(screenly.settings.greeting)

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
        <span class="message-body-content">A simple message app allows users to display text on a screen, making it a basic tool for digital signage. Users can input and edit both the heading and message body directly from the Screenly dashboard.</span>
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
      <div class="secondary-card clock-card">
        <div class="clock-div">
          <AnalogClock />
        </div>
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
}

.message-body {
  display: flex;
  align-items: flex-start;
  justify-content: normal;
}

/* Card Styles */
.info-card {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  background-color: var(--theme-color-tertiary);
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
  background-color: var(--theme-color-tertiary);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

.clock-card {
  background-color: var(--theme-color-tertiary);
}

/* Clock Scaling */
.clock-div {
  transform: scale(0.45);

  @media screen and (max-width: 800px) and (orientation: landscape) {
    transform: scale(0.2);
  }

  @media screen and (max-width: 1024px) and (orientation: landscape) {
    transform: scale(0.25);
  }

  @media screen and (max-width: 1280px) and (orientation: landscape) {
    transform: scale(0.35);
  }

  @media screen and (max-width: 1366px) and (orientation: landscape) {
    transform: scale(0.3);
  }

  @media screen and (max-width: 1920px) and (orientation: landscape) {
    transform: scale(0.45);
  }

  @media screen and (max-width: 2560px) and (orientation: landscape) {
    transform: scale(0.5);
  }

  // Portrait scaling
  @media screen and (max-width: 480px) and (orientation: portrait) {
    transform: scale(0.2);
  }

  @media screen and (max-width: 720px) and (orientation: portrait) {
    transform: scale(0.3);
  }

  @media screen and (max-width: 1080px) and (orientation: portrait) {
    transform: scale(0.45);
  }

  @media screen and (max-width: 2160px) and (orientation: portrait) {
    transform: scale(0.85);
  }
}
</style>
