<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import EventTimeRange from './EventTimeRange.vue'
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

const currentDayOfWeek = computed(() => props.currentDayOfWeek)
const events = computed(() => props.events)

const filterAndFormatEvents = () => {
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
}

watch([events, () => props.timezone], filterAndFormatEvents, {
  immediate: true,
})
</script>

<template>
  <div class="ScheduleCalendarView primary-card">
    <div class="schedule-day-section">
      <h2 class="day-header">{{ currentDayOfWeek }}</h2>
      <div class="events-list">
        <div
          v-for="(event, index) in todayEvents"
          :key="index"
          class="schedule-event-block"
          :style="
            event.backgroundColor
              ? { backgroundColor: event.backgroundColor }
              : {}
          "
        >
          <div class="event-title">{{ event.title }}</div>
          <EventTimeRange
            :start-time="event.startTime"
            :end-time="event.endTime"
            :locale="props.locale"
            :timezone="props.timezone"
          />
        </div>
        <div v-if="todayEvents.length === 0" class="no-events">
          No events scheduled for today
        </div>
      </div>
    </div>

    <div v-if="tomorrowEvents.length > 0" class="schedule-day-section">
      <h2 class="day-header">TOMORROW</h2>
      <div class="events-list">
        <div
          v-for="(event, index) in tomorrowEvents"
          :key="index"
          class="schedule-event-block"
          :style="
            event.backgroundColor
              ? { backgroundColor: event.backgroundColor }
              : {}
          "
        >
          <div class="event-title">{{ event.title }}</div>
          <EventTimeRange
            :start-time="event.startTime"
            :end-time="event.endTime"
            :locale="props.locale"
            :timezone="props.timezone"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/calendar/schedule-calendar-view';
</style>
