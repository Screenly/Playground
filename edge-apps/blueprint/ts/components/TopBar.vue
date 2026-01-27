<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  brandLogoUrl: string
  brandLabel?: string
  now: Date
  locale: string
  timezone: string
}>()

const currentTime = ref(new Date())
let timeInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

const formattedDateTime = computed(() => {
  const date = currentTime.value

  // Use a single formatter to respect locale-specific date/time ordering and formatting
  const formatter = new Intl.DateTimeFormat(props.locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: props.timezone,
  })

  return formatter.format(date)
})
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <div v-if="brandLogoUrl" class="top-bar-logo-container">
        <img :src="brandLogoUrl" class="top-bar-logo" alt="Brand Logo" />
      </div>
      <span v-if="brandLabel" class="top-bar-label">{{ brandLabel }}</span>
    </div>
    <div class="top-bar-right">
      <span class="top-bar-datetime">{{ formattedDateTime }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--primary-color, #003366);
  color: white;
  padding: clamp(0.75rem, 1.5vmin, 3rem) clamp(1rem, 2vmin, 4rem);
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vmin, 2rem);
}

.top-bar-logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 50%;
  padding: clamp(0.4rem, 0.8vmin, 1.5rem);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: clamp(2.5rem, 4vmin, 6rem);
  height: clamp(2.5rem, 4vmin, 6rem);
  flex-shrink: 0;
}

.top-bar-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.top-bar-label {
  font-size: clamp(0.875rem, 1.5vmin, 2.5rem);
  font-weight: 600;
  letter-spacing: 0.025em;
}

.top-bar-right {
  display: flex;
  align-items: center;
}

.top-bar-datetime {
  font-size: clamp(0.875rem, 1.5vmin, 2.5rem);
  font-weight: 500;
}

@media (min-width: 1920px) and (min-height: 1080px) {
  .top-bar {
    padding: clamp(1rem, 1.8vmin, 3.5rem) clamp(1.5rem, 2.5vmin, 5rem);
  }

  .top-bar-logo-container {
    width: clamp(3rem, 4.5vmin, 7rem);
    height: clamp(3rem, 4.5vmin, 7rem);
  }

  .top-bar-label {
    font-size: clamp(1rem, 1.8vmin, 3rem);
  }

  .top-bar-datetime {
    font-size: clamp(1rem, 1.8vmin, 3rem);
  }
}

@media (min-width: 3840px) and (min-height: 2160px) {
  .top-bar {
    padding: clamp(1.5rem, 2vmin, 4rem) clamp(2rem, 3vmin, 6rem);
  }

  .top-bar-logo-container {
    width: clamp(3.5rem, 5vmin, 8rem);
    height: clamp(3.5rem, 5vmin, 8rem);
  }

  .top-bar-label {
    font-size: clamp(1.5rem, 2.2vmin, 4rem);
  }

  .top-bar-datetime {
    font-size: clamp(1.5rem, 2.2vmin, 4rem);
  }
}

@media (orientation: portrait) {
  .top-bar {
    padding: clamp(1rem, 2.5vmin, 4rem) clamp(1.5rem, 3vmin, 6rem);
  }

  .top-bar-logo-container {
    width: clamp(3rem, 5.5vmin, 8rem);
    height: clamp(3rem, 5.5vmin, 8rem);
  }

  .top-bar-label {
    font-size: clamp(1.2rem, 2.5vmin, 4rem);
  }

  .top-bar-datetime {
    font-size: clamp(1.2rem, 2.5vmin, 4rem);
  }
}
</style>
