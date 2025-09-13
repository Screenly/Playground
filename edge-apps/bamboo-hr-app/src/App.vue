<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'

import screenlyLogo from 'blueprint/assets/images/screenly.svg'
import { useSettingsStore } from '@/stores/settings'
import { useHrDataStore } from '@/stores/hr-data'
import OnLeaveSection from '@/components/OnLeaveSection.vue'
import BirthdaysSection from '@/components/BirthdaysSection.vue'
import AnniversariesSection from '@/components/AnniversariesSection.vue'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const useMetadataStore = defineStore('metadataStore', metadataStoreSetup)

const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()
const metadataStore = useMetadataStore()
const hrDataStore = useHrDataStore()

// Reactive data
const currentTime = ref('')
const hasError = ref(false)
const errorMessage = ref('')

// Computed properties
const brandLogoUrl = computed(() => {
  return baseSettingsStore.brandLogoUrl || screenlyLogo
})

// Methods
const updateClock = () => {
  const now = new Date()
  const locale = settingsStore.currentLocale
  const timezone = settingsStore.currentTimezone

  const time = now.toLocaleTimeString(locale, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
  const date = now.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
  currentTime.value = `${time} — ${date}`
}

const showError = (message: string) => {
  hasError.value = true
  errorMessage.value = message
}

onBeforeMount(async () => {
  settingsStore.init()
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(async () => {
  // Validate API key
  if (!settingsStore.hasValidApiKey()) {
    showError('Missing API credentials. Please check your configuration.')
    screenly.signalReadyForRendering()
    return
  }

  try {
    const latitude = metadataStore.coordinates[0]
    const longitude = metadataStore.coordinates[1]

    settingsStore.init()
    settingsStore.initLocale()
    settingsStore.initTimezone(latitude, longitude)

    updateClock()
    setInterval(updateClock, 1000)

    await hrDataStore.init()
  } catch (error) {
    console.error('Failed to initialize application:', error)
    showError('Failed to initialize the application. Please try again later.')
  } finally {
    screenly.signalReadyForRendering()
  }
})
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="app-header-left">
        <div class="app-header-title">BambooHR Dashboard</div>
        <div class="app-header-screenly">Powered by Screenly</div>
      </div>
      <div class="app-header-right">
        <div class="app-clock">{{ currentTime }}</div>
        <img :src="brandLogoUrl" alt="Brand Logo" class="brand-logo" />
      </div>
    </header>

    <main class="app-main">
      <div v-if="hasError" class="dashboard-card error-card">
        <h2 class="dashboard-card-title error-title">Error</h2>
        <p class="error-message">{{ errorMessage }}</p>
      </div>
      <template v-else>
        <OnLeaveSection />
        <BirthdaysSection />
        <AnniversariesSection />
      </template>
    </main>
  </div>
</template>

<style scoped lang="scss"></style>
