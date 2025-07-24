<script setup lang="ts">
import { onBeforeMount, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useScreenlyMetadataStore } from '@/stores/metadata-store'
import { useSettingsStore } from '@/stores/settings-store'
import InfoCard from '@/components/InfoCard.vue'
import NameIcon from '@/components/NameIcon.vue'
import HardwareIcon from '@/components/HardwareIcon.vue'
import VersionIcon from '@/components/VersionIcon.vue'
import CoordinatesIcon from '@/components/CoordinatesIcon.vue'
import screenlyLogo from '@/assets/images/screenly.svg'

const screenlyMetadataStore = useScreenlyMetadataStore()
const settingsStore = useSettingsStore()

// Destructure reactive properties while maintaining reactivity
const {
  hostname,
  screenName,
  hardware,
  screenlyVersion,
  formattedCoordinates,
  tags,
} = storeToRefs(screenlyMetadataStore)

const { brandLogoUrl, primaryThemeColor } = storeToRefs(settingsStore)

onBeforeMount(async () => {
  settingsStore.setupTheme()
  await settingsStore.setupBrandingLogo()
})

onMounted(() => {
  screenly.signalReadyForRendering()
})

const cards = [
  {
    class: 'host-name-card',
    title: 'Host Name',
    value: () => hostname.value,
    icon: NameIcon,
    iconLabel: 'Host Name',
  },
  {
    class: 'screen-name-card',
    title: 'Name',
    value: () => screenName.value,
    icon: NameIcon,
    iconLabel: 'Name',
  },
  {
    class: 'hardware-name-card',
    title: 'Hardware',
    value: () => hardware.value,
    icon: HardwareIcon,
    iconLabel: 'Hardware',
  },
  {
    class: 'version-name-card',
    title: 'Version',
    value: () => screenlyVersion.value,
    icon: VersionIcon,
    iconLabel: 'Version',
  },
  {
    class: 'coordinates-card',
    title: 'Coordinates',
    value: () => formattedCoordinates.value,
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
        :src="brandLogoUrl || screenlyLogo"
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
          :color="primaryThemeColor"
        />
        <span class="icon-card-text head-text">{{ card.iconLabel }}</span>
      </template>
    </InfoCard>

    <InfoCard class="labels-name-card" title="Labels">
      <template #icon>
        <VersionIcon class="icon-card-icon" :color="primaryThemeColor" />
        <span class="icon-card-text head-text">Labels</span>
      </template>
      <div class="label-chip-container">
        <div v-for="tag in tags" :key="tag" class="label-chip">
          {{ tag }}
        </div>
      </div>
    </InfoCard>
  </div>
</template>

<style scoped></style>
