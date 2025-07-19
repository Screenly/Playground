<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import { useScreenlyMetadataStore, useSettingsStore } from './stores/root-store'
import InfoCard from '@/components/InfoCard.vue'
import NameIcon from '@/components/NameIcon.vue'
import HardwareIcon from '@/components/HardwareIcon.vue'
import VersionIcon from '@/components/VersionIcon.vue'
import CoordinatesIcon from '@/components/CoordinatesIcon.vue'
import screenlyLogo from '@/assets/images/screenly.svg'

const screenlyMetadataStore = useScreenlyMetadataStore()
const settingsStore = useSettingsStore()

onBeforeMount(async () => {
  settingsStore.setupTheme()
  await settingsStore.setupBrandingLogo()
})

onMounted(() => {
  screenly.signalReadyForRendering()
})

// Card configuration for DRY rendering
const cards = [
  {
    class: 'host-name-card',
    title: 'Host Name',
    value: () => screenlyMetadataStore.hostname,
    icon: NameIcon,
    iconLabel: 'Host Name',
  },
  {
    class: 'screen-name-card',
    title: 'Name',
    value: () => screenlyMetadataStore.screenName,
    icon: NameIcon,
    iconLabel: 'Name',
  },
  {
    class: 'hardware-name-card',
    title: 'Hardware',
    value: () => screenlyMetadataStore.hardware,
    icon: HardwareIcon,
    iconLabel: 'Hardware',
  },
  {
    class: 'version-name-card',
    title: 'Version',
    value: () => screenlyMetadataStore.screenlyVersion,
    icon: VersionIcon,
    iconLabel: 'Version',
  },
  {
    class: 'coordinates-card',
    title: 'Coordinates',
    value: () => screenlyMetadataStore.formattedCoordinates,
    icon: CoordinatesIcon,
    iconLabel: 'Coordinates',
  },
]
</script>

<template>
  <div class="main-container main-container-grid">
    <InfoCard class="brand-logo-card">
      <img
        id="brand-logo"
        :src="settingsStore.brandLogoUrl || screenlyLogo"
        class="brand-logo"
        alt="Brand Logo"
      />
      <span class="info-text">Powered by Screenly</span>
    </InfoCard>

    <InfoCard
      v-for="card in cards"
      :key="card.class"
      :class="card.class"
      :title="card.title"
      :value="card.value()"
    >
      <template #icon>
        <component
          :is="card.icon"
          class="icon-card-icon"
          :color="settingsStore.primaryThemeColor"
        />
        <span class="icon-card-text head-text">{{ card.iconLabel }}</span>
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

<style scoped>
/* Add any additional styles here if needed */
</style>
