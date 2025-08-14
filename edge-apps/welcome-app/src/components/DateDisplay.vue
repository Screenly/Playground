<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  timezone?: string
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  timezone: 'UTC',
  locale: 'en'
})

const currentDate = ref(new Date())

let dateTimer: ReturnType<typeof setInterval> | null = null

const updateDate = () => {
  currentDate.value = new Date()
}

const getDateInTimezone = (date: Date, timezone: string, locale: string) => {
  try {
    // Use Intl.DateTimeFormat to get date in the specified timezone
    const formatter = new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: 'short',
      day: '2-digit'
    })

    const parts = formatter.formatToParts(date)
    const dateParts: Record<string, string> = {}

    parts.forEach((part) => {
      if (part.type !== 'literal') {
        dateParts[part.type] = part.value
      }
    })

    return {
      dayName: dateParts.weekday?.toUpperCase() || 'SUN',
      dayNumber: dateParts.day || '01'
    }
  } catch (error) {
    console.warn(`Invalid timezone or locale: ${timezone}, ${locale}`, error)
    // Fallback
    const fallbackFormatter = new Intl.DateTimeFormat('en', {
      weekday: 'short',
      day: '2-digit'
    })
    const parts = fallbackFormatter.formatToParts(date)
    const dateParts: Record<string, string> = {}

    parts.forEach((part) => {
      if (part.type !== 'literal') {
        dateParts[part.type] = part.value
      }
    })

    return {
      dayName: dateParts.weekday?.toUpperCase() || 'SUN',
      dayNumber: dateParts.day || '01'
    }
  }
}

const dateInfo = ref(getDateInTimezone(currentDate.value, props.timezone, props.locale))

const updateDateInfo = () => {
  dateInfo.value = getDateInTimezone(currentDate.value, props.timezone, props.locale)
}

onMounted(() => {
  updateDate()
  updateDateInfo()
  dateTimer = setInterval(() => {
    updateDate()
    updateDateInfo()
  }, 60000) // Update every minute
})

onUnmounted(() => {
  if (dateTimer) {
    clearInterval(dateTimer)
  }
})
</script>

<template>
  <div class="date-display">
    <span class="date-text">{{ dateInfo.dayName }}</span>
    <span class="date-number">{{ dateInfo.dayNumber }}</span>
  </div>
</template>

<style scoped lang="scss">
.date-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  gap: 0.5rem;
}

.date-text {
  color: var(--theme-color-secondary);
  font-weight: 400;
  font-size: clamp(1rem, 3vw + 3vh, 1000rem);
}

.date-number {
  color: var(--theme-color-primary);
  font-weight: 400;
  font-size: clamp(1rem, 6.5vw + 6.5vh, 1000rem);
}
</style>
