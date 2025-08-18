<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)

import { useCalendarStore } from '@/stores/calendar'
import EventTimeRange from '@/components/EventTimeRange.vue'
import type { CalendarEvent, TimeSlot } from '@/constants'

interface Props {
  timezone?: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: 'UTC',
})

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const calendarStore = useCalendarStore()

const timeSlots = ref<TimeSlot[]>([])
const locale = ref<string | null>(null)
const isReady = ref(false)

const now = computed(() => calendarStore.now)
const events = computed(() => calendarStore.events)

// Calculate current hour info - memoized for performance
const currentHourInfo = computed(() => {
  const currentHour = parseInt(
    new Date(now.value).toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: props.timezone,
    }),
  )
  return {
    current: currentHour,
    start: currentHour - 1,
    windowStart: (currentHour - 2 + 24) % 24,
  }
})

// Calculate start of week date - memoized for performance
const weekStart = computed(() => {
  const d = new Date(now.value)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
})

// Pre-computed event map for better performance
const eventMap = computed(() => {
  if (!events.value) return new Map()

  const map = new Map<string, CalendarEvent[]>()

  events.value.forEach((event) => {
    const eventStart = new Date(event.startTime)

    // Use toLocaleString for proper hour and day extraction
    const eventHour = parseInt(
      eventStart.toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: props.timezone,
      }),
    )

    const eventDayOfWeek = eventStart.toLocaleString('en-US', {
      weekday: 'long',
      timeZone: props.timezone,
    })

    const dayIndex = DAYS_OF_WEEK.findIndex((day) =>
      day.toLowerCase().startsWith(eventDayOfWeek.toLowerCase().slice(0, 3)),
    )

    const key = `${dayIndex}-${eventHour}`
    if (!map.has(key)) {
      map.set(key, [])
    }
    map.get(key)!.push(event)
  })

  return map
})

// Generate time slots - optimized for performance
const generateTimeSlots = async () => {
  try {
    const userLocale = calendarStore.locale
    locale.value = userLocale

    const slots: TimeSlot[] = []
    const currentHour = currentHourInfo.value.current

    // Calculate dynamic 12-hour window based on current time
    // Constraints: 12 slots, ending at 12:00 AM (midnight)
    let startHour: number

    if (currentHour > 12) {
      // Afternoon/Evening: Show window ending at midnight
      // Always show 11 hours before midnight to midnight (1:00 PM to 12:00 AM)
      startHour = 13 // 1:00 PM
    } else {
      // Morning: Show window ending at midnight of the same day
      // For current time X, show X to X+11 (ending at midnight)
      startHour = currentHour
    }

    // Generate slots for the 12-hour window
    for (let i = 0; i < 12; i++) {
      const hour = (startHour + i) % 24

      // Use toLocaleTimeString for proper formatting
      const baseDate = new Date(now.value)
      baseDate.setHours(hour, 0, 0, 0)
      const timeString = baseDate.toLocaleTimeString(userLocale, {
        hour: 'numeric',
        minute: '2-digit',
      })

      slots.push({
        time: timeString,
        hour,
      })
    }

    timeSlots.value = slots
    isReady.value = true
  } catch (error) {
    console.error('Error generating time slots:', error)
    // Fallback to simple time slots if locale fetch fails
    const slots: TimeSlot[] = []
    const currentHour = currentHourInfo.value.current

    // Calculate dynamic 12-hour window based on current time
    let startHour: number

    if (currentHour > 12) {
      // Afternoon/Evening: Show window ending at midnight
      startHour = 13 // 1:00 PM
    } else {
      // Morning: Show window ending at midnight of the same day
      startHour = currentHour
    }

    for (let i = 0; i < 12; i++) {
      const hour = (startHour + i) % 24

      // Fix the 12-hour format to properly show 12 AM
      const formattedHour = hour === 0 ? 12 : hour % 12 || 12
      const ampm = hour < 12 ? 'AM' : 'PM'

      slots.push({
        time: `${formattedHour}:00 ${ampm}`,
        hour,
      })
    }
    timeSlots.value = slots
    isReady.value = true
  }
}

// Get events for a specific time slot and day - optimized with pre-computed map
const getEventsForTimeSlot = (
  hour: number,
  dayOffset: number,
): CalendarEvent[] => {
  const key = `${dayOffset}-${hour}`
  return eventMap.value.get(key) || []
}

// Get header date for a specific day
const getHeaderDate = (dayIndex: number): number => {
  const date = new Date(weekStart.value)
  date.setDate(date.getDate() + dayIndex)
  return date.getDate()
}

// Check if a day is today
const isToday = (dayIndex: number): boolean => {
  const date = new Date(weekStart.value)
  date.setDate(date.getDate() + dayIndex)
  const today = new Date(now.value)
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Memoized event style computation
const eventStyleCache = new Map<string, Record<string, string>>()

// Get style for an event - with caching for better performance
const getEventStyle = (event: CalendarEvent): Record<string, string> => {
  const cacheKey = `${event.startTime}-${event.endTime}`

  if (eventStyleCache.has(cacheKey)) {
    return eventStyleCache.get(cacheKey)!
  }

  const startTime = dayjs(event.startTime).tz(props.timezone)
  const endTime = dayjs(event.endTime).tz(props.timezone)

  const startMinutes = startTime.minute()
  const topOffset = startMinutes === 0 ? 50 : (startMinutes / 60) * 100 + 50

  // Calculate duration using dayjs
  const duration = endTime.diff(startTime, 'minute', true)
  const durationHours = duration / 60

  // Calculate the raw height
  const rawHeight = durationHours * 100

  // Determine the maximum visible height based on the last time slot
  const lastVisibleHour =
    timeSlots.value[timeSlots.value.length - 1]?.hour || 23

  // For events that span across midnight, ensure they extend to at least touch the 12:00 AM line
  let maxVisibleHeight: number
  if (endTime.date() !== startTime.date()) {
    // Event spans across midnight, ensure it extends to midnight (hour 0)
    maxVisibleHeight = (24 - startTime.hour()) * 100
  } else {
    // Event is within the same day
    maxVisibleHeight = (lastVisibleHour - startTime.hour()) * 100
  }

  // Limit the height to the maximum visible height
  const height = Math.min(rawHeight, maxVisibleHeight)

  const endHour = endTime.hour()

  // Create the base style object
  const baseStyle: Record<string, string> = {
    top: `${topOffset}%`,
    height: `${height}%`,
  }

  // Check if the event extends beyond the visible time slots
  if (
    endHour >= lastVisibleHour ||
    (endTime.date() !== startTime.date() && endHour < timeSlots.value[0]?.hour)
  ) {
    baseStyle['border-bottom-left-radius'] = '0'
    baseStyle['border-bottom-right-radius'] = '0'
  }

  // Cache the result
  eventStyleCache.set(cacheKey, baseStyle)

  // Limit cache size to prevent memory leaks
  if (eventStyleCache.size > 100) {
    const firstKey = eventStyleCache.keys().next().value
    if (firstKey) {
      eventStyleCache.delete(firstKey)
    }
  }

  return baseStyle
}

// Get month/year display
const monthYearDisplay = computed(() => {
  if (!locale.value) return ''
  try {
    const date = new Date(now.value)
    const monthYear = date.toLocaleDateString(locale.value, {
      month: 'long',
      year: 'numeric',
    })
    const [month, year] = monthYear.split(' ')
    return `${month.toUpperCase()} ${year}`
  } catch (error) {
    console.error('Error formatting month/year:', error)
    // Fallback to simple format
    const date = new Date(now.value)
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return `${monthNames[date.getMonth()].toUpperCase()} ${date.getFullYear()}`
  }
})

// Calculate current time position for the red line
const currentTimePosition = computed(() => {
  if (timeSlots.value.length === 0) return 0

  const currentHour = parseInt(
    now.value.toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: props.timezone,
    }),
  )
  const currentMinute = now.value.getMinutes()

  // Find the time slot that contains the current hour
  const currentSlotIndex = timeSlots.value.findIndex(
    (slot) => slot.hour === currentHour,
  )

  if (currentSlotIndex === -1) return -1 // Hide indicator if current time is not in visible range

  // Calculate the percentage position within the current hour
  // Add 30 minutes to move the line further down
  const minutePercentage = (currentMinute + 30) / 60

  // Calculate position as percentage of total visible time slots
  const position =
    ((currentSlotIndex + minutePercentage) / timeSlots.value.length) * 100

  return Math.max(0, Math.min(100, position))
})

// Check if current time indicator should be visible
const showCurrentTimeIndicator = computed(() => {
  return currentTimePosition.value >= 0 && currentTimePosition.value <= 100
})

// Clear style cache when events change
watch(
  events,
  () => {
    eventStyleCache.clear()
  },
  { deep: true },
)

watch([now, props.timezone, currentHourInfo], generateTimeSlots, {
  immediate: true,
})

// Update current time position every minute for smooth movement
watch(
  now,
  () => {
    // Force reactivity update for current time position
    // The computed property will automatically recalculate
  },
  { immediate: true },
)
</script>

<template>
  <div class="primary-card weekly-view">
    <div v-if="!isReady || timeSlots.length === 0" class="weekly-calendar">
      <div style="padding: 2rem; text-align: center">Loading calendar...</div>
    </div>
    <div v-else class="weekly-calendar">
      <div class="month-year-header">{{ monthYearDisplay }}</div>
      <div class="week-header">
        <div class="time-label-spacer" />
        <div v-for="(day, index) in DAYS_OF_WEEK" :key="day" class="day-header">
          <span>{{ day }} </span>
          <span :class="{ 'current-date': isToday(index) }">
            {{ getHeaderDate(index) }}
          </span>
        </div>
      </div>
      <div class="week-body">
        <div v-for="slot in timeSlots" :key="slot.hour" class="week-row">
          <div class="time-label">{{ slot.time }}</div>
          <div
            v-for="(_, dayIndex) in DAYS_OF_WEEK"
            :key="`${dayIndex}-${slot.hour}`"
            class="day-column"
          >
            <div class="hour-line" />
            <div
              v-for="event in getEventsForTimeSlot(slot.hour, dayIndex)"
              :key="event.startTime"
              class="calendar-event-item"
              :style="getEventStyle(event)"
            >
              <div class="event-title">{{ event.title }}</div>
              <EventTimeRange
                :start-time="event.startTime"
                :end-time="event.endTime"
                :locale="locale"
                :timezone="props.timezone"
              />
            </div>
          </div>
        </div>
        <div
          v-if="showCurrentTimeIndicator"
          class="current-time-indicator"
          :style="{ top: `${currentTimePosition}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped src="@/assets/weekly-calendar-view.scss"></style>
