<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import { useScreenlyMetadataStore, useSettingsStore } from './stores/root-store'
import InfoCard from '@/components/InfoCard.vue'
import NameIcon from '@/components/NameIcon.vue'
import HardwareIcon from '@/components/HardwareIcon.vue'
import VersionIcon from '@/components/VersionIcon.vue'
import CoordinatesIcon from '@/components/CoordinatesIcon.vue'

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
    <InfoCard class="host-name-card" title="Host Name" :value="screenlyMetadataStore.hostname">
      <template #icon>
        <NameIcon class="icon-card-icon" :color="settingsStore.primaryThemeColor" />
        <span class="icon-card-text head-text">Host Name</span>
      </template>
    </InfoCard>
    <InfoCard class="screen-name-card" title="Name" :value="screenlyMetadataStore.screenName">
      <template #icon>
        <NameIcon class="icon-card-icon" :color="settingsStore.primaryThemeColor" />
        <span class="icon-card-text head-text">Name</span>
      </template>
    </InfoCard>
    <InfoCard class="hardware-name-card" title="Hardware" :value="screenlyMetadataStore.hardware">
      <template #icon>
        <HardwareIcon class="icon-card-icon" :color="settingsStore.primaryThemeColor" />
        <span class="icon-card-text head-text">Hardware</span>
      </template>
    </InfoCard>
    <InfoCard class="brand-logo-card">
      <img id="brand-logo" src="./assets/images/screenly.svg" class="brand-logo" alt="Brand Logo" />
      <span class="info-text">Powered by Screenly</span>
    </InfoCard>
    <InfoCard
      class="version-name-card"
      title="Version"
      :value="screenlyMetadataStore.screenlyVersion"
    >
      <template #icon>
        <VersionIcon class="icon-card-icon" :color="settingsStore.primaryThemeColor" />
        <span class="icon-card-text head-text">Version</span>
      </template>
    </InfoCard>
    <InfoCard
      class="coordinates-card"
      title="Coordinates"
      :value="screenlyMetadataStore.formattedCoordinates"
    >
      <template #icon>
        <CoordinatesIcon class="icon-card-icon" :color="settingsStore.primaryThemeColor" />
        <span class="icon-card-text head-text">Coordinates</span>
      </template>
    </InfoCard>
    <InfoCard class="labels-name-card" title="Labels">
      <template #icon>
        <VersionIcon class="icon-card-icon" :color="settingsStore.primaryThemeColor" />
        <span class="icon-card-text head-text">Labels</span>
      </template>
      <div class="label-chip-container">
        <div v-for="tag in screenlyMetadataStore.tags" :key="tag" class="label-chip">
          {{ tag }}
        </div>
      </div>
    </InfoCard>
  </div>
</template>

<style scoped></style>
