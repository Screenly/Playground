<template>
  <div class="CalendarOverview secondary-card calendar-overview-card">
    <div class="calendar">
      <div class="calendar-header">
        {{ currentMonthName }} {{ currentYear }}
      </div>
      <div class="calendar-weekdays">
        <div v-for="(day, index) in weekDays" :key="index">{{ day }}</div>
      </div>
      <div class="calendar-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="[
            'calendar-cell',
            { 'other-month': !day.isCurrentMonth },
            { 'current-day': day.day === currentDate && day.isCurrentMonth },
          ]"
        >
          {{ day.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalendarDay } from '../../constants/calendar'

interface CalendarOverviewProps {
  currentDate: number
  currentMonthName: string
  currentYear: number
  currentMonth: number
}

const props = defineProps<CalendarOverviewProps>()

const currentDate = computed(() => props.currentDate)
const currentMonthName = computed(() => props.currentMonthName)
const currentYear = computed(() => props.currentYear)

// Generate week days based on locale
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// Generate calendar days with proper month handling
const calendarDays = computed((): CalendarDay[] => {
  const date = new Date(currentYear.value, props.currentMonth, 1)
  const firstDayOfMonth = date.getDay() // 0-6 (Sunday-Saturday)
  const daysInMonth = new Date(
    currentYear.value,
    date.getMonth() + 1,
    0,
  ).getDate()
  const daysInPrevMonth = new Date(
    currentYear.value,
    date.getMonth(),
    0,
  ).getDate()

  const calendarDaysArray: CalendarDay[] = []

  // Add days from previous month
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDaysArray.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
    })
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDaysArray.push({
      day: i,
      isCurrentMonth: true,
    })
  }

  // Calculate how many days we need to complete the last week
  const totalDays = calendarDaysArray.length
  const remainingDays = (7 - (totalDays % 7)) % 7

  // Add days from next month only if needed to complete the last week
  for (let i = 1; i <= remainingDays; i++) {
    calendarDaysArray.push({
      day: i,
      isCurrentMonth: false,
    })
  }

  return calendarDaysArray
})
</script>

<style scoped lang="scss">
@use '../../styles/calendar/calendar-overview';
</style>
