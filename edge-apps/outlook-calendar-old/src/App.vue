<script setup lang="ts">
import { onBeforeMount, onMounted, type Ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { TopBar } from 'blueprint/components'
import {
  DailyCalendarView,
  ScheduleCalendarView,
  WeeklyCalendarView,
} from 'blueprint/components'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'

import { useCalendarStore } from '@/stores/calendar'
import { useSettingsStore } from '@/stores/settings'
import type { CalendarEvent } from '@/constants'

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

const { timezone, now, events, locale, currentDayOfWeek } = storeToRefs(
  calendarStore,
) as {
  timezone: Ref<string>
  now: Ref<Date>
  events: Ref<CalendarEvent[]>
  locale: Ref<string>
  currentDayOfWeek: Ref<string>
}

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
  <div class="app-container">
    <TopBar
      :brand-logo-url="brandLogoUrl || screenlyLogo"
      :locale="locale"
      :timezone="timezone"
      :style="{
        backgroundColor: primaryThemeColor,
      }"
    />
    <div class="main-container">
      <ScheduleCalendarView
        v-if="calendarMode === 'schedule'"
        :timezone="timezone"
        :now="now"
        :events="events"
        :locale="locale"
        :current-day-of-week="currentDayOfWeek"
      />
      <DailyCalendarView
        v-if="calendarMode === 'daily'"
        :timezone="timezone"
        :now="now"
        :events="events"
        :locale="locale"
      />
      <WeeklyCalendarView
        v-if="calendarMode === 'weekly'"
        :timezone="timezone"
        :now="now"
        :events="events"
        :locale="locale"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-container {
  flex: 1;
  overflow: hidden;
}
</style>
