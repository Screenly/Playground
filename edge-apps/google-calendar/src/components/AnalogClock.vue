<template>
  <div class="secondary-card calendar-overview-card">
    <div class="clock">
      <div class="seconds-bar">
        <span v-for="i in 8" :key="i" :style="{ '--index': i - 1 }">
          <p />
        </span>
      </div>
      <div class="hands-box">
        <div
          class="hand hour"
          :style="{ transform: `rotate(${hands.hours}deg)` }"
        >
          <i />
        </div>
        <div
          class="hand minute"
          :style="{ transform: `rotate(${hands.minutes}deg)` }"
        >
          <i />
        </div>
        <div
          class="hand second"
          :style="{ transform: `rotate(${hands.seconds}deg)` }"
        >
          <i />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { getTimeZone } from '@/utils'

interface ClockHands {
  hours: number
  minutes: number
  seconds: number
}

const calendarStore = useCalendarStore()

const hands = ref<ClockHands>({ hours: 0, minutes: 0, seconds: 0 })

const now = computed(() => calendarStore.now)

const updateClockHands = () => {
  const timeZone = getTimeZone()
  const localTime = new Date(now.value.toLocaleString('en-US', { timeZone }))

  const hours = localTime.getHours()
  const minutes = localTime.getMinutes()
  const seconds = localTime.getSeconds()

  hands.value = {
    hours: hours * 30 + minutes / 2, // 30 degrees per hour + adjustment for minutes
    minutes: minutes * 6, // 6 degrees per minute
    seconds: seconds * 6, // 6 degrees per second
  }
}

watch(now, updateClockHands, { immediate: true })
</script>

<style scoped src="@/assets/analog-clock.css">
/* Styles imported from CSS file */
</style>
