<script setup lang="ts">
import { computed, onBeforeMount, onMounted } from 'vue'
import { defineStore } from 'pinia'

import { AnalogClock } from 'blueprint/components'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'
import { metadataStoreSetup } from 'blueprint/stores/metadata-store'

import { useCalendarStore } from '@/stores/calendar'
import { useSettingsStore } from '@/stores/settings'
import MonthlyCalendarView from '@/components/MonthlyCalendarView.vue'
import CalendarOverview from '@/components/CalendarOverview.vue'
import InfoCard from '@/components/InfoCard.vue'
import DailyCalendarView from '@/components/DailyCalendarView.vue'
import WeeklyCalendarView from '@/components/WeeklyCalendarView.vue'

const useMetadataStore = defineStore('metadataStore', metadataStoreSetup)
const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()
const metadataStore = useMetadataStore()
const calendarStore = useCalendarStore()
const settingsStore = useSettingsStore()

const calendarMode = computed(() => settingsStore.calendarMode)
const primaryThemeColor = computed(() => baseSettingsStore.primaryThemeColor)
const secondaryThemeColor = computed(
  () => baseSettingsStore.secondaryThemeColor,
)

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  settingsStore.init()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(async () => {
  await calendarStore.initialize()

  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="main-container">
    <MonthlyCalendarView v-if="calendarMode === 'monthly'" />
    <DailyCalendarView v-if="calendarMode === 'daily'" />
    <WeeklyCalendarView v-if="calendarMode === 'weekly'" />

    <div class="secondary-container">
      <div class="row-container">
        <InfoCard />
      </div>
      <div class="row-container">
        <CalendarOverview v-if="calendarMode === 'monthly'" />
        <div
          class="secondary-card"
          :style="{
            backgroundColor: primaryThemeColor,
          }"
        >
          <AnalogClock class="app-clock" />
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
