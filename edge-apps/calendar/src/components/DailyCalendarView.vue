<template>
  <div class="primary-card">
    <div v-if="!isReady || timeSlots.length === 0" class="daily-calendar">
      <div style="padding: 2rem; text-align: center">Loading calendar...</div>
    </div>
    <div v-else class="daily-calendar">
      <div v-for="(slot, index) in timeSlots" :key="index" class="time-slot">
        <div class="time-label">{{ slot.time }}</div>
        <div class="time-content">
          <div class="hour-line" />
          <div
            v-for="(event, eventIndex) in getEventsForTimeSlot(slot.hour)"
            :key="eventIndex"
            class="calendar-event-item"
            :style="getEventStyle(event)"
          >
            <div class="event-title">
              {{ event.title }}
            </div>
            <div>
              <EventTimeRange
                :start-time="event.startTime"
                :end-time="event.endTime"
                :locale="locale"
                :timezone="props.timezone"
              />
            </div>
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
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import EventTimeRange from '@/components/EventTimeRange.vue'
import type { CalendarEvent, TimeSlot } from '@/constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)

interface Props {
  timezone?: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: 'UTC',
})

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

// Pre-computed event map for better performance
const eventMap = computed(() => {
  if (!events.value) return new Map()

  const map = new Map<number, CalendarEvent[]>()
  const today = dayjs(now.value).tz(props.timezone)

  events.value.forEach((event) => {
    const eventStart = dayjs(event.startTime).tz(props.timezone)

    // Only include events for today
    if (eventStart.isSame(today, 'day')) {
      const eventHour = eventStart.hour()

      if (!map.has(eventHour)) {
        map.set(eventHour, [])
      }
      map.get(eventHour)!.push(event)
    }
  })

  return map
})

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
  } catch {
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

// Get events for a specific time slot - optimized with pre-computed map
const getEventsForTimeSlot = (hour: number): CalendarEvent[] => {
  return eventMap.value.get(hour) || []
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

  // Create the base style object
  const baseStyle: Record<string, string> = {
    top: `${topOffset}%`,
    height: `${height}%`,
    'border-radius': '6px',
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

// Clear style cache when events change
watch(
  events,
  () => {
    eventStyleCache.clear()
  },
  { deep: true },
)

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
  // Add 45 minutes to move the line further down
  const minutePercentage = (currentMinute + 45) / 60

  // Calculate position as percentage of total visible time slots
  const position =
    ((currentSlotIndex + minutePercentage) / timeSlots.value.length) * 100

  return Math.max(0, Math.min(100, position))
})

// Check if current time indicator should be visible
const showCurrentTimeIndicator = computed(() => {
  return currentTimePosition.value >= 0 && currentTimePosition.value <= 100
})

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

<style scoped src="@/assets/daily-calendar-view.scss"></style>
