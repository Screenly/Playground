<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { AnalogClock, DateDisplay } from 'blueprint/components'
import { useSettingsStore } from '@/stores/settings'
import screenlyLogo from 'blueprint/assets/images/screenly.svg'
import WelcomeHead from '@/components/welcomeHead.vue'
import WelcomeMessage from '@/components/welcomeMessage.vue'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const useMetadataStore = defineStore('metadataStore', metadataStoreSetup)

const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()
const metadataStore = useMetadataStore()

const { brandLogoUrl } = storeToRefs(baseSettingsStore) as unknown as {
  brandLogoUrl: Ref<string>
}

const { welcomeHeading, welcomeMessage } = storeToRefs(
  settingsStore,
) as unknown as {
  welcomeHeading: Ref<string>
  welcomeMessage: Ref<string>
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  try {
    const coordinates = metadataStore.coordinates
    const latitude = coordinates[0] ?? 0
    const longitude = coordinates[1] ?? 0

    settingsStore.init()
    settingsStore.initLocale()
    settingsStore.initTimezone(latitude, longitude)
  } catch (error) {
    console.error('Failed to initialize application:', error)
  } finally {
    screenly.signalReadyForRendering()
  }
})
</script>

<template>
  <div class="main-container">
    <div class="primary-container">
      <div class="primary-card welcome-card">
        <WelcomeHead :value="welcomeHeading" />
        <WelcomeMessage :value="welcomeMessage" />
      </div>
      <div class="primary-card info-card">
        <img
          :src="brandLogoUrl || screenlyLogo"
          class="brand-logo"
          alt="Brand Logo"
        />
        <span class="info-text">Powered by Screenly</span>
      </div>
    </div>

    <div class="row-container">
      <div class="secondary-card date-card">
        <DateDisplay
          :timezone="settingsStore.currentTimezone"
          :locale="settingsStore.currentLocale"
        />
      </div>
      <div class="secondary-card clock-card">
        <div class="clock-div">
          <AnalogClock
            :timezone="settingsStore.currentTimezone"
            :locale="settingsStore.currentLocale"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/analog-clock-overrides.scss' as *;
@use '@/assets/border-radius-overrides.scss' as *;
@use '@/assets/gap-overrides.scss' as *;

.main-container {
  display: flex;
  flex-direction: row;
  height: 100%;
  background-color: var(--theme-color-background);
}

.primary-container {
  background-color: var(--theme-color-tertiary);
  width: 75%;
  display: flex;
  flex-direction: column;
  gap: clamp(2rem, 1vw + 1vh, 1000rem);
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
  flex-direction: row;
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.date-card,
.clock-card {
  height: 50%;
  width: 100%;
}

.clock-card {
  background-color: var(--theme-color-primary);
}

.brand-logo {
  margin: 0 0 clamp(1rem, calc(2.5vw + 2.5vh), 1000rem)
    clamp(1rem, calc(3vw + 3vh), 1000rem);
  width: clamp(1rem, calc(4vw + 4vh), 1000rem);
}

.info-text {
  font-size: clamp(0.8rem, 0.7vw + 0.7vh, 1000rem);
  margin: 0 clamp(1rem, 2.5vw + 2.5vh, 1000rem) clamp(1rem, 3vw + 3vh, 1000rem)
    0;
}

// Global date number override

.date-card :deep(.date-number) {
  font-size: clamp(1rem, calc(6.5vw + 6.5vh), 1000rem);
}

.date-card :deep(.date-text) {
  font-size: clamp(1rem, calc(3vw + 3vh), 1000rem);
}

// Media Query Portrait
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

  .date-card,
  .clock-card {
    height: 100%;
    width: 50%;
  }

  .date-card {
    order: 2;
  }
}

@include border-radius-overrides;
@include gap-overrides;
</style>
