<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import MonthlyCalendarView from '@/components/MonthlyCalendarView.vue'
import CalendarOverview from '@/components/CalendarOverview.vue'
import InfoCard from '@/components/InfoCard.vue'
import DailyCalendarView from '@/components/DailyCalendarView.vue'
import AnalogClock from '@/components/AnalogClock.vue'
import WeeklyCalendarView from '@/components/WeeklyCalendarView.vue'

// Import CSS styles
import '@/assets/common.css'
import '@/assets/style.css'

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
        <AnalogClock v-else />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>
