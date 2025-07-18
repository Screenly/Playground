<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import { useScreenlyMetadataStore, useSettingsStore } from './stores/root-store'
import InfoCard from './components/InfoCard.vue'

import nameIcon from './assets/images/icons/name-icon.svg'
import hardwareIcon from './assets/images/icons/hardware-icon.svg'
import versionIcon from './assets/images/icons/version-icon.svg'
import coordinatesIcon from './assets/images/icons/coordinates-icon.svg'

const screenlyMetadataStore = useScreenlyMetadataStore()
const settingsStore = useSettingsStore()

onBeforeMount(() => {
  settingsStore.setupTheme()
})

onMounted(() => {
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container main-container-grid">
    <InfoCard
      class="host-name-card"
      :icon="nameIcon"
      title="Host Name"
      :value="screenlyMetadataStore.hostname"
    />
    <InfoCard
      class="screen-name-card"
      :icon="nameIcon"
      title="Name"
      :value="screenlyMetadataStore.screenName"
    />
    <InfoCard
      class="hardware-name-card"
      :icon="hardwareIcon"
      title="Hardware"
      :value="screenlyMetadataStore.hardware"
    />
    <InfoCard class="brand-logo-card">
      <img id="brand-logo" src="./assets/images/screenly.svg" class="brand-logo" alt="Brand Logo" />
      <span class="info-text">Powered by Screenly</span>
    </InfoCard>
    <InfoCard
      class="version-name-card"
      :icon="versionIcon"
      title="Version"
      :value="screenlyMetadataStore.screenlyVersion"
    />
    <InfoCard
      class="coordinates-card"
      :icon="coordinatesIcon"
      title="Coordinates"
      :value="screenlyMetadataStore.formattedCoordinates"
    />
    <InfoCard class="labels-name-card" :icon="versionIcon" title="Labels">
      <div class="label-chip-container">
        <div v-for="tag in screenlyMetadataStore.tags" :key="tag" class="label-chip">
          {{ tag }}
        </div>
      </div>
    </InfoCard>
  </div>
</template>

<style scoped></style>
