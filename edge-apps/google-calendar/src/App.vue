<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { AnalogClock, BrandLogoCard } from 'blueprint/components'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'

import { useCalendarStore } from '@/stores/calendar'
import { useSettingsStore } from '@/stores/settings'
import MonthlyCalendarView from '@/components/MonthlyCalendarView.vue'
import CalendarOverview from '@/components/CalendarOverview.vue'
import DailyCalendarView from '@/components/DailyCalendarView.vue'
import WeeklyCalendarView from '@/components/WeeklyCalendarView.vue'

import screenlyLogo from 'blueprint/assets/images/screenly.svg'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()
const calendarStore = useCalendarStore()
const settingsStore = useSettingsStore()

const { calendarMode } = storeToRefs(settingsStore) as unknown as {
  calendarMode: Ref<string>
}

const { brandLogoUrl, primaryThemeColor } = storeToRefs(
  baseSettingsStore,
) as unknown as {
  brandLogoUrl: Ref<string>
  primaryThemeColor: Ref<string>
}

const { timezone } = storeToRefs(calendarStore) as {
  timezone: Ref<string>
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  settingsStore.init()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(async () => {
  document.title = 'Google Calendar' // TODO: Remove this after testing.

  await calendarStore.initialize()

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container">
    <MonthlyCalendarView v-if="calendarMode === 'monthly'" />
    <DailyCalendarView :timezone="timezone" v-if="calendarMode === 'daily'" />
    <WeeklyCalendarView :timezone="timezone" v-if="calendarMode === 'weekly'" />

    <div class="secondary-container">
      <div class="row-container">
        <div class="secondary-card">
          <BrandLogoCard :logo-src="brandLogoUrl || screenlyLogo" />
        </div>
      </div>
      <div class="row-container">
        <CalendarOverview v-if="calendarMode === 'monthly'" />
        <div
          class="secondary-card"
          :style="{
            backgroundColor: primaryThemeColor,
          }"
          v-if="['daily', 'weekly'].includes(calendarMode)"
        >
          <AnalogClock class="app-clock" :timezone="timezone" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$base-scale: 0.25;

.app-clock {
  @media screen and (min-width: 800px) and (orientation: landscape) {
    transform: scale($base-scale);
  }

  @media screen and (min-width: 1280px) and (orientation: landscape) {
    transform: scale($base-scale * 1.5);
  }

  @media screen and (min-width: 1920px) and (orientation: landscape) {
    transform: scale($base-scale * 2.25);
  }

  @media screen and (min-width: 3840px) and (orientation: landscape) {
    transform: scale($base-scale * 4.5);
  }

  @media screen and (min-width: 480px) and (orientation: portrait) {
    transform: scale($base-scale * 1);
  }

  @media screen and (min-width: 720px) and (orientation: portrait) {
    transform: scale($base-scale * 1.6);
  }

  @media screen and (min-width: 1080px) and (orientation: portrait) {
    transform: scale($base-scale * 2.4);
  }

  @media screen and (min-width: 2160px) and (orientation: portrait) {
    transform: scale($base-scale * 4.8);
  }
}
</style>
