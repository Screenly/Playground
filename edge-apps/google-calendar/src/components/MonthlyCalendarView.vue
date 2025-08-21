<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { getFormattedTime } from '@/utils'
import type { CalendarEvent } from '@/constants'

const MAX_EVENTS = 7

const calendarStore = useCalendarStore()

const todayEvents = ref<CalendarEvent[]>([])
const tomorrowEvents = ref<CalendarEvent[]>([])
const formattedEventTimes = ref<Record<string, string>>({})

const currentDayOfWeek = computed(() => calendarStore.currentDayOfWeek)
const events = computed(() => calendarStore.events)
const locale = computed(() => calendarStore.locale)

const filterAndFormatEvents = async () => {
  // Filter events for today and tomorrow separately
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayStart.getDate() + 1)

  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(todayStart.getDate() + 1)
  const tomorrowEnd = new Date(tomorrowStart)
  tomorrowEnd.setDate(tomorrowStart.getDate() + 1)

  // Filter today's events
  const todayEventsList = events.value.filter((event: CalendarEvent) => {
    const eventStart = new Date(event.startTime)
    return eventStart >= now && eventStart < todayEnd
  })

  // Filter tomorrow's events
  const tomorrowEventsList = events.value.filter((event: CalendarEvent) => {
    const eventStart = new Date(event.startTime)
    return eventStart >= tomorrowStart && eventStart < tomorrowEnd
  })

  // Sort events by start time
  todayEventsList.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  )
  tomorrowEventsList.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  )

  // Distribute events to maintain total around MAX_EVENTS
  let limitedTodayEvents: CalendarEvent[]
  let limitedTomorrowEvents: CalendarEvent[]

  if (todayEventsList.length >= MAX_EVENTS) {
    // If today has 7+ events, show only today's events
    limitedTodayEvents = todayEventsList.slice(0, MAX_EVENTS)
    limitedTomorrowEvents = []
  } else {
    // Show all of today's events and fill remaining slots with tomorrow's events
    limitedTodayEvents = todayEventsList
    const remainingSlots = MAX_EVENTS - todayEventsList.length
    limitedTomorrowEvents = tomorrowEventsList.slice(0, remainingSlots)
  }

  todayEvents.value = limitedTodayEvents
  tomorrowEvents.value = limitedTomorrowEvents

  // Format times for all events
  const times: Record<string, string> = {}
  const allEvents = [...limitedTodayEvents, ...limitedTomorrowEvents]

  for (const event of allEvents) {
    try {
      const formattedTime = await getFormattedTime(
        new Date(event.startTime),
        locale.value,
      )
      times[event.startTime] = formattedTime
    } catch (error) {
      console.error('Error formatting time:', error)
      times[event.startTime] = '...'
    }
  }
  formattedEventTimes.value = { ...formattedEventTimes.value, ...times }
}

watch([events, locale], filterAndFormatEvents, { immediate: true })
</script>

<template>
  <div class="MonthlyCalendarView primary-card">
    <!-- Today's Events -->
    <div class="events-heading">
      <h1>{{ currentDayOfWeek }}</h1>
    </div>
    <div class="events-container">
      <div v-for="(event, index) in todayEvents" :key="index" class="event-row">
        <div class="event-time">
          {{ formattedEventTimes[event.startTime] || '...' }}
        </div>
        <div class="event-title">
          <span class="event-dot">•</span>
          {{ event.title }}
        </div>
      </div>
      <div v-if="todayEvents.length === 0" class="no-events">
        No events scheduled for today
      </div>
    </div>

    <!-- Tomorrow's Events -->
    <div v-if="tomorrowEvents.length > 0" class="events-heading">
      <h1>TOMORROW</h1>
    </div>
    <div v-if="tomorrowEvents.length > 0" class="events-container">
      <div
        v-for="(event, index) in tomorrowEvents"
        :key="index"
        class="event-row"
      >
        <div class="event-time">
          {{ formattedEventTimes[event.startTime] || '...' }}
        </div>
        <div class="event-title">
          <span class="event-dot">•</span>
          {{ event.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/monthly-calendar-view.scss"></style>
