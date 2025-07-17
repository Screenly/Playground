<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import { useScreenlyMetadataStore, useSettingsStore } from './stores/root-store'
import InfoCard from './components/InfoCard.vue'

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
      icon="static/images/icons/name-icon.svg"
      title="Host Name"
      :value="screenlyMetadataStore.hostname"
    />
    <InfoCard
      class="screen-name-card"
      icon="./static/images/icons/name-icon.svg"
      title="Name"
      :value="screenlyMetadataStore.screenName"
    />
    <InfoCard
      class="hardware-name-card"
      icon="./static/images/icons/hardware-icon.svg"
      title="Hardware"
      :value="screenlyMetadataStore.hardware"
    />
    <InfoCard class="brand-logo-card">
      <img id="brand-logo" src="./assets/images/screenly.svg" class="brand-logo" alt="Brand Logo" />
      <span class="info-text">Powered by Screenly</span>
    </InfoCard>
    <InfoCard
      class="version-name-card"
      icon="./static/images/icons/version-icon.svg"
      title="Version"
      :value="screenlyMetadataStore.screenlyVersion"
    />
    <InfoCard
      class="coordinates-card"
      icon="./static/images/icons/coordinates-icon.svg"
      title="Coordinates"
      :value="screenlyMetadataStore.formattedCoordinates"
    />
    <InfoCard class="labels-name-card" icon="./static/images/icons/version-icon.svg" title="Labels">
      <div class="label-chip-container">
        <div v-for="tag in screenlyMetadataStore.tags" :key="tag" class="label-chip">
          {{ tag }}
        </div>
      </div>
    </InfoCard>
  </div>
</template>

<style scoped></style>
