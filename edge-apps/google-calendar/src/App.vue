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

const { brandLogoUrl } = storeToRefs(baseSettingsStore) as unknown as {
  brandLogoUrl: Ref<string>
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
      :brand-logo-url="brandLogoUrl"
      :now="now"
      :locale="locale"
      :timezone="timezone"
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
$base-scale: 0.25;

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
