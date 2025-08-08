<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { PrimaryCard } from 'blueprint/components'
import { AnalogClock } from 'blueprint/components'
import WelcomeMessage from './components/WelcomeMessage.vue'
import DateDisplay from './components/DateDisplay.vue'
import BrandInfoCard from './components/BrandInfoCard.vue'
import { useSettingsStore } from './stores/settings'

const useScreenlyMetadataStore = defineStore('metadata', metadataStoreSetup)
const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const screenlyMetadataStore = useScreenlyMetadataStore()
const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()

const { coordinates } = storeToRefs(
  screenlyMetadataStore,
) as unknown as {
  coordinates: Ref<[number, number]>
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()

  // Initialize settings
  settingsStore.init()

  // Apply theme colors
  settingsStore.applyThemeColors()
})

onMounted(async () => {
  const latitude = coordinates.value[0]
  const longitude = coordinates.value[1]

  // Initialize locale and timezone
  await settingsStore.initLocale(latitude, longitude)
  await settingsStore.initTimezone(latitude, longitude)

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container">
    <!-- Primary Container-->
    <div class="primary-container">
      <div class="primary-card welcome-card">
        <WelcomeMessage
          :heading="settingsStore.settings.value.welcome_heading"
          :message="settingsStore.settings.value.welcome_message"
        />
      </div>
      <div class="primary-card info-card">
        <BrandInfoCard
          :logo-src="settingsStore.getBrandLogoUrl()"
          logo-alt="Brand Logo"
          info-text="Powered by Screenly"
        />
      </div>
    </div>
    <!-- Row Container with modules -->
    <div class="row-container">
      <div class="secondary-card date-card">
        <DateDisplay
          :timezone="settingsStore.currentTimezone.value"
          :locale="settingsStore.currentLocale.value"
        />
      </div>
      <div class="secondary-card clock-card">
                <AnalogClock
          :timezone="settingsStore.currentTimezone.value"
          :locale="settingsStore.currentLocale.value"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Container Configurations */
.main-container {
  display: flex;
  flex-direction: row;
  gap: var(--custom-4k-gap);
  height: 100%;
  padding: var(--custom-4k-padding);
  background-color: var(--theme-color-background);
}

.primary-container {
  background-color: var(--theme-color-tertiary);
  border-radius: var(--custom-4k-border-radius-big);
  width: 75%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  justify-content: space-between;
}

.primary-card {
  background-color: var(--theme-color-tertiary);
  color: var(--theme-color-primary);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.welcome-card {
  align-items: flex-start;
  justify-content: normal;
}

.info-card {
  align-items: flex-end;
  justify-content: space-between;
}

.row-container {
  flex-direction: column;
  height: 100%;
  width: 25%;
  gap: var(--custom-4k-gap);
  display: flex;
}

.secondary-card {
  width: 100%;
  height: 100%;
  gap: unset;
  background-color: var(--theme-color-tertiary);
  border-radius: var(--custom-4k-border-radius-medium);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.date-card, .clock-card {
  height: 50%;
  width: 100%;
}

.clock-card {
  background-color: var(--theme-color-primary);

  /* Scale the blueprint clock component to match the HTML version */
  :deep(.clock-container) {
    transform: scale(1.3);
  }
}

/* Media Query Portrait */
@media (orientation: portrait) {
  .main-container {
    flex-direction: column;
    display: flex;
  }

  .primary-container {
    width: 100%;
    height: 75%;
  }

  .row-container {
    width: 100%;
    height: 25%;
    flex-direction: row;
  }

  .date-card, .clock-card {
    height: 100%;
    width: 50%;
  }

  .date-card {
    order: 2;
  }

  .clock-card {
    order: 1;
  }

  .welcome-card {
    gap: clamp(1rem, 1vw + 2vh, 1000rem);
  }
}

/* Media Query Landscape */

/* QHD/WQHD Monitors - 2560×1440 */
@media screen and (max-width: 2560px) and (orientation: landscape) {
  .main-container {
    gap: var(--hd-gap);
    padding: var(--hd-padding);
  }

  .primary-container {
    border-radius: var(--hd-border-radius-big);
  }

  .secondary-card {
    border-radius: var(--hd-border-radius-medium);
  }

  .row-container {
    gap: var(--hd-gap);
  }

  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.8);
    }
  }
}

/* Full HD Landscape - 1920 × 1080 */
@media screen and (max-width: 1920px) and (orientation: landscape) {
  .row-container {
    gap: var(--hd-gap);
  }

  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.6);
    }
  }
}

/* Custom resolution - 1680 × 962 (Landscape) */
@media screen and (max-width: 1680px) and (orientation: landscape) {
  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.55);
    }
  }
}

/* Laptop Standard - 1366×768 */
@media screen and (max-width: 1366px) and (orientation: landscape) {
  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.45);
    }
  }
}

/* HD Landscape - 1280 × 720 */
@media screen and (max-width: 1280px) and (orientation: landscape) {
  .main-container {
    gap: var(--custom-720-gap);
    padding: var(--custom-720-padding);
  }

  .primary-container {
    border-radius: var(--custom-720-border-radius-big);
  }

  .secondary-card {
    border-radius: var(--custom-720-border-radius-medium);
  }

  .row-container {
    gap: var(--custom-720-gap);
  }

  .clock-card {
   height: 47%;

    :deep(.clock-container) {
      transform: scale(0.45);
    }
  }
}

/* Tablets & Small Laptops - 1024×768 & 1024×600 */
@media screen and (max-width: 1024px) and (orientation: landscape) {
  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.35);
    }
  }
}

/* Raspberry Pi Touch Display - Landscape 800 × 480 */
@media screen and (max-width: 800px) and (orientation: landscape) {
  .main-container {
    gap: var(--pi-gap);
    padding: var(--pi-padding);
  }

  .primary-container {
    border-radius: var(--pi-border-radius-big);
  }

  .secondary-card {
    border-radius: var(--pi-border-radius-medium);
  }

  .row-container {
    gap: var(--pi-gap);
  }

  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.27);
    }
  }
}

/* Portrait Media Queries */

/* 4K Portrait - 4096 × 2160 */
@media screen and (max-width: 3840px) and (orientation: portrait) {
  .main-container {
    gap: var(--custom-4k-gap);
    padding: var(--custom-4k-padding);
  }

  .primary-container {
    border-radius: var(--custom-4k-border-radius-big);
  }

  .secondary-card {
    border-radius: var(--custom-4k-border-radius-medium);
  }

  .row-container {
    gap: var(--custom-4k-gap);
  }

  .clock-card {
    :deep(.clock-container) {
      transform: scale(1.35);
    }
  }
}

/* QHD Portrait - 2560 × 1440 */
@media screen and (max-width: 2159px) and (orientation: portrait) {
  .main-container {
    gap: var(--hd-gap);
    padding: var(--hd-padding);
  }

  .primary-container {
    border-radius: var(--hd-border-radius-big);
  }

  .secondary-card {
    border-radius: var(--hd-border-radius-medium);
  }

  .row-container {
    gap: var(--hd-gap);
  }

  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.85);
    }
  }
}

/* Full HD Portrait - 1080 × 1920 */
@media screen and (max-width: 1080px) and (orientation: portrait) {
  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.65);
    }
  }
}

/* HD Portrait - 720 × 1280 */
@media screen and (max-width: 720px) and (orientation: portrait) {
  .main-container {
    gap: var(--custom-720-gap);
    padding: var(--custom-720-padding);
  }

  .primary-container {
    border-radius: var(--custom-720-border-radius-big);
  }

  .secondary-card {
    border-radius: var(--custom-720-border-radius-medium);
  }

  .row-container {
    gap: var(--custom-720-gap);
  }

  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.45);
    }
  }
}

/* Raspberry Pi Touch Display - Portrait 480 × 800 */
@media screen and (max-width: 480px) and (orientation: portrait) {
  .main-container {
    gap: var(--pi-gap);
    padding: var(--pi-padding);
  }

  .primary-container {
    border-radius: var(--pi-border-radius-big);
  }

  .secondary-card {
    border-radius: var(--pi-border-radius-medium);
  }

  .row-container {
    gap: var(--pi-gap);
  }

  .clock-card {
    :deep(.clock-container) {
      transform: scale(0.25);
    }
  }
}
</style>
