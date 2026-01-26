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
            class="calendar-event-wrapper"
            :style="getWrapperStyle(event)"
          >
            <div class="calendar-event-item" :style="getItemStyle(event)">
              <div class="event-title">
                {{ event.title }}
              </div>
              <div>
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
import EventTimeRange from './EventTimeRange.vue'
import type { CalendarEvent, TimeSlot } from '../../constants/calendar'
import {
  type EventLayout,
  findEventClusters,
  calculateClusterLayouts,
} from '../../utils/event-layout-utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import dayJsTimezone from 'dayjs/plugin/timezone'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(utc)
dayjs.extend(dayJsTimezone)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

interface Props {
  timezone?: string
  now: Date
  events: CalendarEvent[]
  locale: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: 'UTC',
})

const timeSlots = ref<TimeSlot[]>([])
const isReady = ref(false)

const now = computed(() => props.now)
const events = computed(() => props.events)

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

// Calculate event layouts using a column-based algorithm (Google Calendar style)
const eventLayouts = computed(() => {
  const allEvents = getAllEventsForToday.value
  if (allEvents.length === 0) return new Map<CalendarEvent, EventLayout>()

  const layouts = new Map<CalendarEvent, EventLayout>()
  const clusters = findEventClusters(allEvents, props.timezone)

  for (const cluster of clusters) {
    const clusterLayouts = calculateClusterLayouts(cluster, props.timezone)
    for (const [event, layout] of clusterLayouts) {
      layouts.set(event, layout)
    }
  }

  return layouts
})

const getEventLayout = (
  event: CalendarEvent,
): { index: number; total: number; span: number } => {
  const layout = eventLayouts.value.get(event)
  if (!layout) {
    return { index: 0, total: 1, span: 1 }
  }
  return {
    index: layout.column,
    total: layout.totalColumns,
    span: layout.columnSpan,
  }
}

const generateTimeSlots = async () => {
  try {
    const userLocale = props.locale

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

// Get events that START in a specific time slot (to avoid duplicate rendering)
const getEventsForTimeSlot = (hour: number): CalendarEvent[] => {
  return eventMap.value.get(hour) || []
}

// Get all events for today (used for overlap calculations)
const getAllEventsForToday = computed(() => {
  const today = dayjs(now.value).tz(props.timezone)
  return events.value.filter((event) => {
    return dayjs(event.startTime).tz(props.timezone).isSame(today, 'day')
  })
})

// Memoized event style computation
const eventStyleCache = new Map<string, Record<string, string>>()

// Get wrapper style for an event (positioning only) - with caching for better performance
const getWrapperStyle = (event: CalendarEvent): Record<string, string> => {
  // Get layout for this event using column-based algorithm (Google Calendar style)
  const layout = getEventLayout(event)

  // Create cache key that includes layout information to prevent collisions
  // for events with identical start/end/backgroundColor but different positions
  const cacheKey = `wrapper-${event.startTime}-${event.endTime}-${layout.index}-${layout.total}`

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

  // Add minimal gap between adjacent events (like Google Calendar)
  // Reduce height by a small amount to create visual separation
  const eventGap = 4 // 4% gap between events
  const adjustedHeight = Math.max(height - eventGap, height * 0.9) // Ensure height doesn't go below 90% of original

  // Calculate width and left position based on column layout
  // Google Calendar style: events in earlier columns visually overlap into later columns
  const columnWidth = 100 / layout.total
  const eventSpan = layout.span && layout.span > 0 ? layout.span : 1
  const baseWidth = columnWidth * eventSpan
  const left = layout.index * columnWidth

  // Events overlap into the next column's space (except the last column)
  // overlapRatio controls how much of the next column's space to overlap into
  const overlapRatio = 0.7
  const isLastColumn = layout.index + eventSpan >= layout.total
  const overlapBonus = isLastColumn ? 0 : columnWidth * overlapRatio
  const width = baseWidth + overlapBonus

  // Z-index: higher column numbers appear on top (base z-index of 2 from SCSS)
  const zIndex = 2 + layout.index

  // Create the wrapper style object (positioning only)
  const wrapperStyle: Record<string, string> = {
    top: `${topOffset}%`,
    height: `${adjustedHeight}%`,
    width: `${width}%`,
    left: `${left}%`,
    'z-index': `${zIndex}`,
  }

  // Cache the result
  eventStyleCache.set(cacheKey, wrapperStyle)

  // Limit cache size to prevent memory leaks
  if (eventStyleCache.size > 100) {
    const firstKey = eventStyleCache.keys().next().value
    if (firstKey) {
      eventStyleCache.delete(firstKey)
    }
  }

  return wrapperStyle
}

// Get item style for an event (background-color only)
const getItemStyle = (event: CalendarEvent): Record<string, string> => {
  if (event.backgroundColor) {
    return { 'background-color': event.backgroundColor }
  }
  return {}
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

<style scoped src="../../assets/calendar/daily-calendar-view.scss"></style>
