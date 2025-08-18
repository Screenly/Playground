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
const dayOfMonth = ref('00')
const dayOfWeek = ref('MON')

let timeTimer: ReturnType<typeof setInterval> | null = null

const updateTime = () => {
  // Only update if timezone is available
  if (!props.timezone) {
    return
  }

  const now = new Date()
  const timeInTimezone = new Date(
    now.toLocaleString('en-US', { timeZone: props.timezone }),
  )

  const formattedLocale = props.locale.replace('_', '-')

  // Time formatter options
  const timeFormatterOptions = {
    hour: '2-digit',
    minute: '2-digit',
  } as Intl.DateTimeFormatOptions

  // Handle all formatting based on locale with exception handling
  let timeFormatter: Intl.DateTimeFormat
  try {
    timeFormatter = new Intl.DateTimeFormat(
      formattedLocale,
      timeFormatterOptions,
    )
  } catch (error) {
    // Fallback to default locale if the provided locale is invalid
    console.warn(
      `Invalid locale "${formattedLocale}" provided, falling back to "en"`,
      error,
    )
    timeFormatter = new Intl.DateTimeFormat('en', timeFormatterOptions)
  }

  const formattedTimeString = timeFormatter.format(timeInTimezone)

  // Split the formatted time to extract time and period
  const timeParts = formattedTimeString.split(' ')
  formattedTime.value = timeParts[0] || ''
  period.value = timeParts[1] || ''

  dayOfMonth.value = timeInTimezone.getDate().toString()
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  dayOfWeek.value = days[timeInTimezone.getDay()] as string
}

watch(
  () => props.timezone,
  (newTimezone) => {
    if (newTimezone) {
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
  <div class="secondary-card-number-container">
    <span class="secondary-card-number">{{ formattedTime }}</span>
    <span v-if="period" class="secondary-card-time-am-pm">{{ period }}</span>
  </div>
</template>

<style scoped lang="scss">
.secondary-card-number-container {
  display: flex;
  flex-direction: row;
  gap: 3rem;
  align-items: baseline;

  .secondary-card-number {
    font-size: 14.5rem;
    color: var(--theme-color-primary);
    letter-spacing: 1rem;
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum';
  }

  .secondary-card-time-am-pm {
    font-size: 4rem;
    color: var(--theme-color-secondary);
  }

  @media screen and (min-width: 480px) and (orientation: portrait) {
    gap: 1rem;

    .secondary-card-number {
      font-size: 8rem;
      letter-spacing: 0.5rem;
    }

    .secondary-card-time-am-pm {
      font-size: 2.5rem;
    }
  }

  @media screen and (min-width: 720px) and (orientation: portrait) {
    gap: 1rem;

    .secondary-card-number {
      font-size: 11rem;
    }

    .secondary-card-time-am-pm {
      font-size: 3rem;
    }
  }

  @media screen and (min-width: 800px) and (orientation: landscape) {
    gap: 1rem;

    .secondary-card-number {
      font-size: 6rem;
      letter-spacing: 0.5rem;
    }

    .secondary-card-time-am-pm {
      font-size: 2em;
    }
  }

  @media screen and (min-width: 1080px) and (orientation: portrait) {
    gap: 1rem;

    .secondary-card-number {
      font-size: 17rem;
    }

    .secondary-card-time-am-pm {
      font-size: 4rem;
    }
  }

  @media screen and (min-width: 1280px) and (orientation: landscape) {
    gap: 1rem;

    .secondary-card-number {
      font-size: 10rem;
    }

    .secondary-card-time-am-pm {
      font-size: 3rem;
    }
  }

  @media screen and (min-width: 1920px) and (orientation: landscape) {
    gap: 1rem;

    .secondary-card-number {
      font-size: 16rem;
    }

    .secondary-card-time-am-pm {
      font-size: 4.5rem;
    }
  }

  @media screen and (min-width: 2160px) and (orientation: portrait) {
    .secondary-card-number {
      font-size: 40rem;
    }

    .secondary-card-time-am-pm {
      font-size: 9rem;
    }
  }

  @media screen and (min-width: 3840px) and (orientation: landscape) {
    .secondary-card-number {
      font-size: 36rem;
    }

    .secondary-card-time-am-pm {
      font-size: 10rem;
    }
  }

  @media screen and (min-width: 4096px) and (orientation: landscape) {
    .secondary-card-number {
      font-size: 39rem;
    }

    .secondary-card-time-am-pm {
      font-size: 11rem;
    }
  }
}
</style>
