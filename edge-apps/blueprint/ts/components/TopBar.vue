<script setup lang="ts">
import { computed, type Ref, ref, onMounted, onUnmounted } from 'vue'

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

  const dayOfWeek = date.toLocaleDateString(props.locale, {
    weekday: 'short',
    timeZone: props.timezone,
  })

  const day = date.toLocaleDateString(props.locale, {
    day: 'numeric',
    timeZone: props.timezone,
  })

  const month = date.toLocaleDateString(props.locale, {
    month: 'short',
    timeZone: props.timezone,
  })

  const time = date.toLocaleTimeString(props.locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: props.timezone,
  })

  return `${dayOfWeek} ${day} ${month} ${time}`
})
</script>

<template>
  <div class="top-bar">
    <div class="top-bar-left">
      <img
        v-if="brandLogoUrl"
        :src="brandLogoUrl"
        class="top-bar-logo"
        alt="Brand Logo"
      />
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
  padding: 0.5rem 1rem;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;

  @media screen and (min-width: 1280px) {
    padding: 0.6rem 1.5rem;
  }

  @media screen and (min-width: 1920px) {
    padding: 0.75rem 2rem;
  }

  @media screen and (min-width: 3840px) {
    padding: 1.5rem 4rem;
  }
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media screen and (min-width: 1280px) {
    gap: 0.75rem;
  }

  @media screen and (min-width: 1920px) {
    gap: 1rem;
  }

  @media screen and (min-width: 3840px) {
    gap: 2rem;
  }
}

.top-bar-logo {
  height: 1.5rem;
  width: auto;
  object-fit: contain;

  @media screen and (min-width: 1280px) {
    height: 1.75rem;
  }

  @media screen and (min-width: 1920px) {
    height: 2rem;
  }

  @media screen and (min-width: 3840px) {
    height: 4rem;
  }
}

.top-bar-label {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.025em;

  @media screen and (min-width: 1280px) {
    font-size: 1rem;
  }

  @media screen and (min-width: 1920px) {
    font-size: 1.25rem;
  }

  @media screen and (min-width: 3840px) {
    font-size: 2.5rem;
  }
}

.top-bar-right {
  display: flex;
  align-items: center;
}

.top-bar-datetime {
  font-size: 0.875rem;
  font-weight: 500;

  @media screen and (min-width: 1280px) {
    font-size: 1rem;
  }

  @media screen and (min-width: 1920px) {
    font-size: 1.25rem;
  }

  @media screen and (min-width: 3840px) {
    font-size: 2.5rem;
  }
}
</style>
