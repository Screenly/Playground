<template>
  <span class="event-time">{{ timeString }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface WeeklyTimeDisplayProps {
  startTime: string
  endTime: string
  locale: string | null
  timezone: string
}

const props = defineProps<WeeklyTimeDisplayProps>()
const timeString = ref('')

const updateTime = () => {
  try {
    // Use toLocaleTimeString for proper formatting
    const start = new Date(props.startTime).toLocaleTimeString(
      props.locale || 'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: props.timezone,
      },
    )

    const end = new Date(props.endTime).toLocaleTimeString(
      props.locale || 'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: props.timezone,
      },
    )

    timeString.value = `${start} - ${end}`
  } catch {
    // Fallback to simple format
    const start = new Date(props.startTime)
    const end = new Date(props.endTime)
    timeString.value = `${start.getHours()}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours()}:${end.getMinutes().toString().padStart(2, '0')}`
  }
}

watch(
  [
    () => props.startTime,
    () => props.endTime,
    () => props.locale,
    () => props.timezone,
  ],
  updateTime,
  { immediate: true },
)
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
