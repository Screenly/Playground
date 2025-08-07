<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { AnalogClock } from 'blueprint/components'

import { useCalendarStore } from '@/stores/calendar'
import MonthlyCalendarView from '@/components/MonthlyCalendarView.vue'
import CalendarOverview from '@/components/CalendarOverview.vue'
import InfoCard from '@/components/InfoCard.vue'
import DailyCalendarView from '@/components/DailyCalendarView.vue'
import WeeklyCalendarView from '@/components/WeeklyCalendarView.vue'

const calendarStore = useCalendarStore()

const calendarMode = computed(() => calendarStore.calendarMode)

onMounted(async () => {
  await calendarStore.initialize()
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
            backgroundColor: 'var(--theme-color-primary)',
          }"
        >
          <AnalogClock />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$base-scale: 0.25;

.clock-container {
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
