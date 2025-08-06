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
              <WeeklyTimeDisplay
                :start-time="event.startTime"
                :end-time="event.endTime"
                :locale="locale"
                :timezone="timezone"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { getLocale, getTimeZone } from '@/utils'
import WeeklyTimeDisplay from '@/components/WeeklyTimeDisplay.vue'
import type { CalendarEvent, TimeSlot } from '@/constants'

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WINDOW_HOURS = 12

const calendarStore = useCalendarStore()

const timeSlots = ref<TimeSlot[]>([])
const locale = ref<string | null>(null)
const isReady = ref(false)

const now = computed(() => calendarStore.now)
const weeklyViewTime = computed(() => calendarStore.weeklyViewTime)
const events = computed(() => calendarStore.events)

const timezone = getTimeZone()

// Calculate current hour info - memoized for performance
const currentHourInfo = computed(() => {
  const currentHour = parseInt(
    new Date(now.value).toLocaleString('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: timezone,
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

// Generate time slots - optimized for performance
const generateTimeSlots = async () => {
  try {
    const userLocale = await getLocale()
    locale.value = userLocale

    const slots: TimeSlot[] = []
    const baseDate = new Date(now.value)

    for (let i = 0; i < WINDOW_HOURS; i++) {
      const hour = (currentHourInfo.value.start + i) % 24

      // Skip slots at or after midnight
      if (hour === 0 || currentHourInfo.value.start + i >= 24) {
        continue
      }

      // Use toLocaleTimeString for proper formatting
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
    for (let i = 0; i < WINDOW_HOURS; i++) {
      const hour = (currentHourInfo.value.start + i) % 24
      if (hour === 0 || currentHourInfo.value.start + i >= 24) continue

      const formattedHour = hour % 12 || 12
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

// Get events for a specific time slot and day
const getEventsForTimeSlot = (
  hour: number,
  dayOffset: number,
): CalendarEvent[] => {
  if (!events.value) return []

  return events.value.filter((event) => {
    const eventStart = new Date(event.startTime)

    // Use toLocaleString for proper hour and day extraction
    const eventHour = parseInt(
      eventStart.toLocaleString('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      }),
    )

    const eventDayOfWeek = eventStart.toLocaleString('en-US', {
      weekday: 'long',
      timeZone: timezone,
    })

    const dayIndex = DAYS_OF_WEEK.findIndex((day) =>
      day.toLowerCase().startsWith(eventDayOfWeek.toLowerCase().slice(0, 3)),
    )

    const isBeforeMidnight = hour < 24
    const isInWindow =
      hour >= currentHourInfo.value.windowStart &&
      hour < currentHourInfo.value.windowStart + WINDOW_HOURS

    return (
      dayIndex === dayOffset &&
      eventHour === hour &&
      isBeforeMidnight &&
      isInWindow
    )
  })
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

// Get style for an event
const getEventStyle = (event: CalendarEvent): Record<string, string> => {
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)

  const startMinutes = startTime.getMinutes()
  const topOffset = startMinutes === 0 ? 50 : (startMinutes / 60) * 100 + 50

  // Calculate duration in hours and minutes
  let durationHours = endTime.getHours() - startTime.getHours()
  let durationMinutes = endTime.getMinutes() - startTime.getMinutes()

  // Handle events that span across midnight
  if (endTime.getDate() !== startTime.getDate()) {
    // Add 24 hours to account for the day change
    durationHours += 24
  }

  // Handle negative minutes
  if (durationMinutes < 0) {
    durationHours -= 1
    durationMinutes += 60
  }

  // Calculate the raw height
  const rawHeight = (durationHours + durationMinutes / 60) * 100

  // Determine the maximum visible height based on the last time slot
  const lastVisibleHour =
    timeSlots.value[timeSlots.value.length - 1]?.hour || 23
  const maxVisibleHeight = (lastVisibleHour - startTime.getHours()) * 100

  // Limit the height to the maximum visible height
  const height = Math.min(rawHeight, maxVisibleHeight)

  const endHour = endTime.getHours()

  // Create the base style object
  const baseStyle: Record<string, string> = {
    top: `${topOffset}%`,
    height: `${height}%`,
    'border-radius': '6px',
    border: '2px solid var(--border-color, white)',
  }

  // Check if the event extends beyond the visible time slots
  if (
    endHour >= lastVisibleHour ||
    (endTime.getDate() !== startTime.getDate() &&
      endHour < timeSlots.value[0]?.hour)
  ) {
    // Add the dotted border to indicate the event continues beyond the visible area
    baseStyle['border-bottom-left-radius'] = '0'
    baseStyle['border-bottom-right-radius'] = '0'
    baseStyle['border-bottom'] = '3px dotted var(--border-color, white)'
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

watch([now, timezone, currentHourInfo], generateTimeSlots, { immediate: true })
</script>

<style scoped src="@/assets/weekly-calendar-view.css">
/* Styles imported from CSS file */
</style>
