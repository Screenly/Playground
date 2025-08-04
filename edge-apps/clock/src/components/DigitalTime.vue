<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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
  const now = new Date()

  // Format time based on locale preference (simplified - in real app would use moment.js)
  const hours = now.getHours()
  const minutes = now.getMinutes()
  const is24Hour = props.locale !== 'en' // Simplified logic

  if (is24Hour) {
    formattedTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    period.value = ''
  } else {
    const displayHours = hours % 12 || 12
    formattedTime.value = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    period.value = hours >= 12 ? 'PM' : 'AM'
  }

  dayOfMonth.value = now.getDate().toString()
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  dayOfWeek.value = days[now.getDay()]
}

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
