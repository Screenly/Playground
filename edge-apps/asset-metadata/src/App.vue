<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import {
  InfoCard,
  NameIcon,
  HardwareIcon,
  VersionIcon,
  CoordinatesIcon,
  BrandLogoCard,
} from 'blueprint/components'
import screenlyLogo from '@/assets/images/screenly.svg'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'

const useScreenlyMetadataStore = defineStore('metadata', metadataStoreSetup)
const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const screenlyMetadataStore = useScreenlyMetadataStore()
const baseSettingsStore = useBaseSettingsStore()

const {
  hostname,
  screenName,
  hardware,
  screenlyVersion,
  formattedCoordinates,
  tags,
} = storeToRefs(screenlyMetadataStore) as unknown as {
  hostname: Ref<string>
  screenName: Ref<string>
  hardware: Ref<string>
  screenlyVersion: Ref<string>
  formattedCoordinates: Ref<string>
  tags: Ref<string[]>
}

const { brandLogoUrl, primaryThemeColor } = storeToRefs(
  baseSettingsStore,
) as unknown as {
  brandLogoUrl: Ref<string>
  primaryThemeColor: Ref<string>
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
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
    <BrandLogoCard :logo-src="brandLogoUrl || screenlyLogo" />

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
