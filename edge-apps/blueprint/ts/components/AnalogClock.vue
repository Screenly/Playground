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

const currentTime = ref(new Date())

let clockTimer: ReturnType<typeof setInterval> | null = null

const updateClock = () => {
  currentTime.value = new Date()
}

const getTimeInTimezone = (date: Date, timezone: string) => {
  try {
    // Use Intl.DateTimeFormat to get time in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })

    const parts = formatter.formatToParts(date)
    const timeParts: Record<string, string> = {}

    parts.forEach(part => {
      if (part.type !== 'literal') {
        timeParts[part.type] = part.value
      }
    })

    return {
      hours: parseInt(timeParts.hour || '0'),
      minutes: parseInt(timeParts.minute || '0'),
      seconds: parseInt(timeParts.second || '0')
    }
  } catch (error) {
    console.warn(`Invalid timezone: ${timezone}, using UTC`, error)
    // Fallback to UTC
    return {
      hours: date.getUTCHours(),
      minutes: date.getUTCMinutes(),
      seconds: date.getUTCSeconds()
    }
  }
}

const getHandRotation = (type: 'hour' | 'minute' | 'second') => {
  const timeInTz = getTimeInTimezone(currentTime.value, props.timezone)

  switch (type) {
    case 'hour':
      return timeInTz.hours * 30 + timeInTz.minutes / 2
    case 'minute':
      return timeInTz.minutes * 6
    case 'second':
      return timeInTz.seconds * 6
    default:
      return 0
  }
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (clockTimer) {
    clearInterval(clockTimer)
  }
})
</script>

<template>
  <div class="clock-container">
    <div class="clock">
      <div class="seconds-bar">
        <span v-for="i in 60" :key="i" :style="{ '--index': i }">
          <p></p>
        </span>
      </div>
      <div class="number-hours"></div>
      <div class="hands-box">
        <div
          class="hand hour"
          :style="{ transform: `rotate(${getHandRotation('hour')}deg)` }"
        >
          <i></i>
        </div>
        <div
          class="hand minute"
          :style="{ transform: `rotate(${getHandRotation('minute')}deg)` }"
        >
          <i></i>
        </div>
        <div
          class="hand second"
          :style="{ transform: `rotate(${getHandRotation('second')}deg)` }"
        >
          <i></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.clock-container {
  width: 36.43rem;
  height: 36.43rem;
  background: #fff;
  border-radius: 50%;
  display: flex;
  justify-self: center;
  align-items: center;
}

.clock-container .clock {
  width: 30rem;
  height: 30rem;
  border-radius: 50%;
  margin: auto;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.clock .number-hours,
.clock .seconds-bar {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.seconds-bar span {
  position: absolute;
  transform: rotate(calc(var(--index) * 45deg));
  inset: -1.43rem;
  text-align: center;
}

.clock .seconds-bar span p {
  background: var(--theme-color-primary);
  width: 0.36rem;
  height: 1.29rem;
  display: inline-block;
  border-radius: 0.14rem;
  transform: translateY(0.07rem);
}

.hands-box {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hands-box .hand {
  position: absolute;
  display: flex;
  justify-content: center;
  transition: transform 0.1s ease-in-out;
}

.hands-box .hour {
  width: 20rem;
  height: 20rem;
}

.hands-box .hour i {
  width: 0.5rem;
  height: 9.86rem;
  background: #fff;
  position: absolute;
  box-shadow: 0 0 2.14rem 0 rgb(0 0 0 / 97%);
}

.hands-box .hour i::before {
  content: '';
  position: absolute;
  height: 7.5rem;
  width: 1.07rem;
  bottom: 2.14rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 1.43rem;
  background: var(--theme-color-primary);
  z-index: 2;
  box-shadow: 0 0 1.71rem 0 rgb(0 0 0 / 26%);
}

.hands-box .hour i::after {
  content: '';
  position: absolute;
  height: 8.21rem;
  width: 1.86rem;
  bottom: 1.79rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 1.79rem;
  background: #fff;
  z-index: 1;
}

.hands-box .minute {
  width: 27.14rem;
  height: 27.14rem;
}

.hands-box .minute::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1.79rem;
  height: 1.79rem;
  background: #fff;
  border-radius: 1.79rem;
  z-index: 999;
}

.hands-box .minute i {
  width: 0.5rem;
  height: 13.57rem;
  background: #fff;
  position: absolute;
  box-shadow: 0 0 2.14rem 0 rgb(0 0 0 / 97%);
}

.hands-box .minute i::before {
  content: '';
  width: 1.86rem;
  height: 14.71rem;
  background: #fff;
  position: absolute;
  bottom: 1.79rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 1.79rem;
  z-index: 1;
  box-shadow: 0 0 1.71rem 0 rgb(0 0 0 / 26%);
}

.hands-box .minute i::after {
  content: '';
  width: 1.07rem;
  height: 13.93rem;
  background: var(--theme-color-primary);
  position: absolute;
  bottom: 2.21rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 1.43rem;
  z-index: 2;
}

.hands-box .second {
  width: 30rem;
  height: 34.29rem;
}

.hands-box .second::before {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1.14rem;
  height: 1.14rem;
  background: #f7410a;
  border-radius: 1.79rem;
}

.hands-box .second::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0.57rem;
  height: 0.57rem;
  background: var(--theme-color-primary);
  border-radius: 1.79rem;
}

.hands-box .second i {
  width: 0.29rem;
  height: calc(15rem + 3.57rem);
  background: #f7410a;
  position: relative;
  border-radius: 0.14rem;
}

.hands-box .second i::before {
  content: '';
  width: 0.29rem;
  height: 3.21rem;
  background: #f7410a;
  position: absolute;
  bottom: -2.93rem;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 0.36rem;
}

/* Media Queries */
@media screen and (min-width: 480px) and (orientation: portrait) {
  .clock-container {
    transform: scale(0.7);
  }
}

@media screen and (min-width: 720px) and (orientation: portrait) {
  .clock-container {
    transform: scale(1);
  }
}

@media screen and (min-width: 800px) and (orientation: landscape) {
  .clock-container {
    transform: scale(0.5);
  }
}

@media screen and (min-width: 1080px) and (orientation: portrait) {
  .clock-container {
    transform: scale(1.25);
  }
}

@media screen and (min-width: 1280px) and (orientation: landscape) {
  .clock-container {
    transform: scale(0.9);
  }
}

@media screen and (min-width: 1920px) and (orientation: landscape) {
  .clock-container {
    transform: scale(1.25);
  }
}

@media screen and (min-width: 2160px) and (orientation: portrait) {
  .clock-container {
    transform: scale(2.7);
  }
}

@media screen and (min-width: 3840px) and (orientation: landscape) {
  .clock-container {
    transform: scale(2.7);
  }
}

@media screen and (min-width: 4096px) and (orientation: landscape) {
  .clock-container {
    transform: scale(2.8);
  }
}
</style>
