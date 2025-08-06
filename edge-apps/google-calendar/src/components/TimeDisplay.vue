<template>
  <span>{{ timeString }}</span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getFormattedTime } from '@/utils'
import type { CalendarEvent } from '@/constants'

interface TimeDisplayProps {
  event: CalendarEvent
}

const props = defineProps<TimeDisplayProps>()
const timeString = ref('')

const updateTime = async () => {
  try {
    const start = await getFormattedTime(new Date(props.event.startTime))
    const end = await getFormattedTime(new Date(props.event.endTime))
    timeString.value = `${start} - ${end}`
  } catch (error) {
    console.error('Error formatting time:', error)
    // Fallback to a simple time format if the async call fails
    const startTime = new Date(props.event.startTime)
    const endTime = new Date(props.event.endTime)
    timeString.value = `${startTime.getHours()}:${startTime.getMinutes().toString().padStart(2, '0')} - ${endTime.getHours()}:${endTime.getMinutes().toString().padStart(2, '0')}`
  }
}

watch(() => props.event, updateTime, { immediate: true })
</script>

<style scoped>
/* Component-specific styles if needed */
</style>
