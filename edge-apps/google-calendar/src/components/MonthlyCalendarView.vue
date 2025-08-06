<template>
  <div class="MonthlyCalendarView primary-card">
    <div class="events-heading">
      <h1>{{ currentDayOfWeek }}</h1>
    </div>
    <div class="events-container">
      <div v-if="filteredEvents.length > 0">
        <div
          v-for="(event, index) in filteredEvents"
          :key="index"
          class="event-row"
        >
          <div class="event-time">
            {{ formattedEventTimes[event.startTime] || '...' }}
          </div>
          <div class="event-details">
            <div class="event-title">
              <span class="event-dot">•</span>
              {{ event.title }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-events">No events scheduled for next 24 hours</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { getFormattedTime } from '@/utils'
import type { CalendarEvent } from '@/constants'

const MAX_EVENTS = 7

const calendarStore = useCalendarStore()

const filteredEvents = ref<CalendarEvent[]>([])
const formattedEventTimes = ref<Record<string, string>>({})

const currentDayOfWeek = computed(() => calendarStore.currentDayOfWeek)
const events = computed(() => calendarStore.events)
const locale = computed(() => calendarStore.locale)

const filterAndFormatEvents = async () => {
  // Filter events for next 24 hours
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(now.getHours() + 24)

  const upcomingEvents = events.value.filter((event: CalendarEvent) => {
    const eventStart = new Date(event.startTime)
    return eventStart >= now && eventStart < tomorrow
  })

  // Sort events by start time
  upcomingEvents.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  )
  const limitedEvents = upcomingEvents.slice(0, MAX_EVENTS)
  filteredEvents.value = limitedEvents

  // Format times for all events
  const times: Record<string, string> = {}
  for (const event of limitedEvents) {
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

<style scoped src="@/assets/monthly-calendar-view.scss">
/* Styles imported from SCSS file */
</style>
