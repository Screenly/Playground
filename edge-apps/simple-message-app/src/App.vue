<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { AnalogClock, BrandLogoCard, DateDisplay } from 'blueprint/components'
import { useSettingsStore } from '@/stores/settings'
import MessageHead from '@/components/MessageHead.vue'
import MessageBody from '@/components/MessageBody.vue'

import screenlyLogo from 'blueprint/assets/images/screenly.svg'

const useMetadataStore = defineStore('metadataStore', metadataStoreSetup)
const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const metadataStore = useMetadataStore()
const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()

const { brandLogoUrl } = storeToRefs(baseSettingsStore) as unknown as {
  brandLogoUrl: Ref<string>
}
const { coordinates } = storeToRefs(metadataStore) as unknown as {
  coordinates: Ref<[number, number]>
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  const latitude = coordinates.value[0]
  const longitude = coordinates.value[1]

  settingsStore.init()
  settingsStore.initLocale()
  settingsStore.initTimezone(latitude, longitude)

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container main-container-grid">
    <div class="primary-container">
      <MessageHead />
    </div>

    <div class="secondary-container">
      <MessageBody />
    </div>
    <!-- Row Container with modules -->
    <div class="row-container">
      <div class="secondary-card">
        <BrandLogoCard
          :logo-src="brandLogoUrl || screenlyLogo"
          class="info-card"
        />
      </div>

      <div class="secondary-card">
        <DateDisplay :timezone="settingsStore.currentTimezone" />
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
@use '@/assets/analog-clock-overrides.scss' as *;
@use '@/assets/brand-logo-card-overrides.scss' as *;

// Section: Grid Layout Styles
// TODO: Move to a separate SCSS file.

.main-container-grid {
  display: grid;
  grid-template-rows: 2fr 0.5fr 0.125fr 0.25fr 0.125fr 0.25fr 0.5fr;
  grid-template-columns: 3fr 0.25fr 0.5fr 0.5fr 0.5fr;

  .primary-container {
    width: 100%;
    grid-area: 1 / 1 / 4 / 3;

    .primary-card {
      width: 100%;
      height: 100%;
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

      .info-card {
        gap: 2rem;
      }
    }
  }
}
</style>
