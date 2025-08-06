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
            <div style="margin-bottom: 0.5rem">
              {{ event.title }}
            </div>
            <div>
              <TimeDisplay :event="event" />
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
import { getFormattedTime } from '@/utils'
import TimeDisplay from '@/components/TimeDisplay.vue'
import type { CalendarEvent, TimeSlot } from '@/constants'

const TOTAL_HOURS = 12 // Total number of time slots to display
const HOURS_BEFORE = 1 // Hours to show before current time

const calendarStore = useCalendarStore()

const timeSlots = ref<TimeSlot[]>([])
const isReady = ref(false)

const now = computed(() => calendarStore.now)
const events = computed(() => calendarStore.events)

const generateTimeSlots = async (currentDate: Date) => {
  const currentHour = currentDate.getHours()
  const startHour = currentHour - HOURS_BEFORE

  const slots: TimeSlot[] = []
  for (let i = 0; i < TOTAL_HOURS; i++) {
    const hour = (startHour + i + 24) % 24 // Ensure hour is between 0-23
    const slotTime = new Date(currentDate)
    slotTime.setHours(hour, 0, 0, 0)

    try {
      const formattedTime = await getFormattedTime(slotTime)
      slots.push({
        time: formattedTime,
        hour,
      })
    } catch (error) {
      console.error('Error formatting time:', error)
      // Fallback to a simple time format if the async call fails
      slots.push({
        time: `${hour}:00`,
        hour,
      })
    }
  }

  timeSlots.value = slots
  isReady.value = true
}

// Helper function to check if an event belongs in a time slot
const getEventsForTimeSlot = (hour: number): CalendarEvent[] => {
  return events.value.filter((event) => {
    const startHour = new Date(event.startTime).getHours()
    return startHour === hour
  })
}

// Helper function to calculate event position and height
const getEventStyle = (event: CalendarEvent): Record<string, string> => {
  const startTime = new Date(event.startTime)
  const endTime = new Date(event.endTime)

  const startHour = startTime.getHours()
  const startMinutes = startTime.getMinutes()
  const endHour = endTime.getHours()
  const endMinutes = endTime.getMinutes()

  // Calculate position from top (percentage within the slot)
  // Add 50% offset to align with hour lines
  const topOffset = startMinutes === 0 ? 50 : (startMinutes / 60) * 100 + 50

  // Calculate duration in hours and minutes
  let durationHours = endHour - startHour
  let durationMinutes = endMinutes - startMinutes

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
  const maxVisibleHeight = (lastVisibleHour - startHour) * 100

  // Limit the height to the maximum visible height
  const height = Math.min(rawHeight, maxVisibleHeight)

  // Add dotted border if event extends beyond visible area
  const style: Record<string, string> = {
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
    style['border-bottom-left-radius'] = '0'
    style['border-bottom-right-radius'] = '0'
    style['border-bottom'] = '3px dotted var(--border-color, white)'
  }

  return style
}

watch(
  now,
  (newNow) => {
    generateTimeSlots(newNow)
  },
  { immediate: true },
)
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
