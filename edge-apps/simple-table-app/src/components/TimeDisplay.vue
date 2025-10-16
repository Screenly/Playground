<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  timezone?: string
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: 'UTC',
  locale: 'en',
})

const formattedTime = ref('00:00')
const period = ref('AM')
const validTimezone = ref(props.timezone)

let timeTimer: ReturnType<typeof setInterval> | null = null

const validateTimezone = (timezone: string): string => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return timezone
  } catch (error) {
    console.warn(
      `Invalid timezone "${timezone}" provided, falling back to "UTC"`,
      error,
    )
    return 'UTC'
  }
}

const updateTime = () => {
  if (!validTimezone.value) {
    return
  }

  const now = new Date()
  const timeInTimezone = new Date(
    now.toLocaleString('en-US', { timeZone: validTimezone.value }),
  )

  const formattedLocale = props.locale.replace('_', '-')

  const timeFormatterOptions = {
    hour: '2-digit',
    minute: '2-digit',
  } as Intl.DateTimeFormatOptions

  let timeFormatter: Intl.DateTimeFormat
  try {
    timeFormatter = new Intl.DateTimeFormat(
      formattedLocale,
      timeFormatterOptions,
    )
  } catch (error) {
    console.warn(
      `Invalid locale "${formattedLocale}" provided, falling back to "en"`,
      error,
    )
    timeFormatter = new Intl.DateTimeFormat('en', timeFormatterOptions)
  }

  const formattedTimeString = timeFormatter.format(timeInTimezone)

  const timeParts = formattedTimeString.split(' ')
  formattedTime.value = timeParts[0] || ''
  period.value = timeParts[1] || ''
}

watch(
  () => props.timezone,
  (newTimezone) => {
    if (newTimezone) {
      validTimezone.value = validateTimezone(newTimezone)
      updateTime()
    }
  },
  { immediate: true },
)

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeTimer) {
    clearInterval(timeTimer)
  }
})
</script>

<template>
  <div class="time-display-container">
    <span class="time-display-time">{{ formattedTime }}</span>
    <span v-if="period" class="time-display-period">{{ period }}</span>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/time-display.scss';
</style>
