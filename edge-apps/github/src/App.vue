<script setup lang="ts">
import { onBeforeMount, onMounted, ref, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { PrimaryCard } from 'blueprint/components'

const useScreenlyMetadataStore = defineStore('metadata', metadataStoreSetup)
const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const screenlyMetadataStore = useScreenlyMetadataStore()
const baseSettingsStore = useBaseSettingsStore()

const { hostname, screenName, hardware, coordinates, location } = storeToRefs(
  screenlyMetadataStore,
) as unknown as {
  hostname: Ref<string>
  screenName: Ref<string>
  hardware: Ref<string>
  coordinates: Ref<[number, number]>
  location: Ref<string>
}

const secretWord = ref(screenly.settings.secret_word)
const greeting = ref(screenly.settings.greeting)

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container">
    <div class="secondary-container">
      <div class="row-container">
        <div class="secondary-card"></div>
      </div>
      <div class="row-container">
        <div class="secondary-card"></div>
      </div>
    </div>

    <PrimaryCard></PrimaryCard>
  </div>
</template>

<style scoped lang="scss"></style>
