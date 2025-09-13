<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'

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

const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()
const hrDataStore = useHrDataStore()

// Reactive data
const currentTime = ref('')

// Computed properties
const brandLogoUrl = computed(() => {
  return baseSettingsStore.brandLogoUrl || screenlyLogo
})

// Methods
const getLocale = (): string => {
  return settingsStore.getLocale()
}

const getTimezone = (): string => {
  return settingsStore.getTimezone()
}

const updateClock = () => {
  const now = new Date()
  const locale = getLocale()
  const timezone = getTimezone()

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

onBeforeMount(async () => {
  settingsStore.init()
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(async () => {
  updateClock()
  setInterval(updateClock, 1000)

  await hrDataStore.init()
  screenly.signalReadyForRendering()
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
      <OnLeaveSection />
      <BirthdaysSection />
      <AnniversariesSection />
    </main>
  </div>
</template>

<style scoped lang="scss"></style>
