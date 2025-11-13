<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getFormattedTime } from '../../utils/calendar'
import type { CalendarEvent } from '../../constants/calendar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)

const MAX_EVENTS = 7

interface Props {
  timezone?: string
  now: Date
  events: CalendarEvent[]
  locale: string
  currentDayOfWeek: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: 'UTC',
})

const todayEvents = ref<CalendarEvent[]>([])
const tomorrowEvents = ref<CalendarEvent[]>([])
const formattedEventTimes = ref<Record<string, string>>({})

const currentDayOfWeek = computed(() => props.currentDayOfWeek)
const events = computed(() => props.events)
const locale = computed(() => props.locale)

const filterAndFormatEvents = async () => {
  // Get current time in the target timezone
  const nowInTimezone = dayjs().tz(props.timezone)
  const todayInTimezone = nowInTimezone.startOf('day')
  const tomorrowInTimezone = todayInTimezone.add(1, 'day')

  // Filter today's events (from now until end of today)
  const todayEventsList = events.value.filter((event: CalendarEvent) => {
    const eventStart = dayjs(event.startTime).tz(props.timezone)
    return (
      eventStart.isAfter(nowInTimezone) &&
      eventStart.isBefore(tomorrowInTimezone)
    )
  })

  // Filter tomorrow's events (full day tomorrow)
  const dayAfterTomorrow = tomorrowInTimezone.add(1, 'day')
  const tomorrowEventsList = events.value.filter((event: CalendarEvent) => {
    const eventStart = dayjs(event.startTime).tz(props.timezone)
    return (
      eventStart.isAfter(tomorrowInTimezone) &&
      eventStart.isBefore(dayAfterTomorrow)
    )
  })

  // Sort events by start time
  const sortByStartTime = (a: CalendarEvent, b: CalendarEvent) => {
    return (
      dayjs(a.startTime).tz(props.timezone).valueOf() -
      dayjs(b.startTime).tz(props.timezone).valueOf()
    )
  }

  todayEventsList.sort(sortByStartTime)
  tomorrowEventsList.sort(sortByStartTime)

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
        dayjs(event.startTime).tz(props.timezone).toDate(),
        locale.value,
        props.timezone,
      )
      times[event.startTime] = formattedTime
    } catch (error) {
      console.error('Error formatting time:', error)
      times[event.startTime] = '...'
    }
  }
  formattedEventTimes.value = { ...formattedEventTimes.value, ...times }
}

watch([events, locale, () => props.timezone], filterAndFormatEvents, {
  immediate: true,
})
</script>

<template>
  <div class="MonthlyCalendarView primary-card">
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

<style scoped src="../../assets/calendar/monthly-calendar-view.scss"></style>
