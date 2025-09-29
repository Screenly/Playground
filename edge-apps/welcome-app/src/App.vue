<script setup lang="ts">
import { onBeforeMount, onMounted, computed, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { AnalogClock, DateDisplay } from 'blueprint/components'
import { useSettingsStore } from '@/stores/settings'
import screenlyLogo from 'blueprint/assets/images/screenly.svg'

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

// Computed properties for settings
const welcomeHeading = computed(() => settingsStore.settings.value.welcome_heading || 'Welcome')
const welcomeMessage = computed(() => settingsStore.settings.value.welcome_message || 'to the team')

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  const latitude = metadataStore.coordinates[0]
  const longitude = metadataStore.coordinates[1]

  settingsStore.init()
  settingsStore.initLocale()
  settingsStore.initTimezone(latitude, longitude)

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container">
    <div class="primary-container">
      <div class="primary-card welcome-card">
        <span class="welcome-heading">{{ welcomeHeading }}</span>
        <span class="welcome-message">{{ welcomeMessage }}</span>
      </div>
      <div class="primary-card info-card">
        <img :src="brandLogoUrl || screenlyLogo" class="brand-logo" alt="Brand Logo" />
        <span class="info-text">Powered by Screenly</span>
      </div>
    </div>

    <div class="row-container">
      <div class="secondary-card date-card">
        <DateDisplay
          :timezone="settingsStore.currentTimezone.value"
          :locale="settingsStore.currentLocale.value"
        />
      </div>
      <div class="secondary-card clock-card">
        <div class="clock-div">
          <AnalogClock
            :timezone="settingsStore.currentTimezone.value"
            :locale="settingsStore.currentLocale.value"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

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
}

// Text and element configurations
.welcome-heading {
  font-size: clamp(1rem, calc(5.5vw + 5.5vh), 1000rem);
  margin: clamp(1rem, calc(2.5vw + 2.5vh), 1000rem) clamp(1rem, calc(2vw + 2vh), 1000rem) 0 clamp(1rem, calc(3vw + 3vh), 1000rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 100%;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  height: 1.05em;
  overflow: hidden;
}

.welcome-message {
  font-size: clamp(1rem, calc(4.5vw + 4.5vh), 1000rem);
  font-weight: 400;
  margin: 0 clamp(1rem, calc(2vw + 2vh), 1000rem) 0 clamp(1rem, calc(3vw + 3vh), 1000rem);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  height: 2.1em;
  overflow: hidden;
}

.brand-logo {
  margin: 0 0 clamp(1rem, calc(2.5vw + 2.5vh), 1000rem) clamp(1rem, calc(3vw + 3vh), 1000rem);
  width: clamp(1rem, calc(6.2vw + 6.2vh), 1000rem);
}

.info-text {
  font-size: clamp(0.8rem, .70vw + .70vh, 1000rem);
  margin: 0 clamp(1rem, 2.5vw + 2.5vh, 1000rem) clamp(1rem, 3vw + 3vh, 1000rem) 0;
}

.clock-div {
  transform: scale(1.3);
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

  .welcome-heading {
    font-size: clamp(1rem, 5vw + 5vh, 1000rem);
    -webkit-line-clamp: 3;
    line-clamp: 3;
    height: unset;
    min-height: 1.1em;
    max-height: calc(1.1em * 3);
  }

  .welcome-message {
    font-size: clamp(1rem, 3vw + 3vh, 1000rem);
    -webkit-line-clamp: 4;
    line-clamp: 4;
    height: unset;
    min-height: 1.1em;
    max-height: calc(1.1em * 4);
  }
}


// Responsive breakpoints

@media screen and (max-width: 4096px) and (orientation: landscape) {
  .clock-div {
    transform: scale(.45);
  }
}

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

  .clock-div {
    transform: scale(.65);
  }
}

@media screen and (max-width: 1920px) and (orientation: landscape) {
  .clock-div {
    transform: scale(.5);
  }
}

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
  }

  .clock-div {
    transform: scale(.45);
  }
}

@media screen and (max-width: 1080px) and (orientation: landscape) {
  .clock-div {
    transform: scale(.40);
  }
}


@media screen and (max-width: 800px) and (orientation: landscape) {
  .main-container {
    gap: var(--pi-gap);
    padding: var(--pi-padding);
  }

  .welcome-message {
    height: 2.09em;
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

  .clock-div {
    transform: scale(.5);
  }

}

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

  .clock-div {
    transform: scale(.45);
  }
}

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

  .clock-div {
    transform: scale(.75);
  }
}

@media screen and (max-width: 1080px) and (orientation: portrait) {
  .clock-div {
    transform: scale(.5);
  }
}

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

  .clock-div {
    transform: scale(.4);
  }
}

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

  .clock-div {
    transform: scale(.5);
  }
}
</style>
