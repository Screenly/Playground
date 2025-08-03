<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const dayOfMonth = ref('00')
const dayOfWeek = ref('MON')

let dateTimer: ReturnType<typeof setInterval> | null = null

const updateDate = () => {
  const now = new Date()
  dayOfMonth.value = now.getDate().toString()
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  dayOfWeek.value = days[now.getDay()]
}

onMounted(() => {
  updateDate()
  dateTimer = setInterval(updateDate, 1000)
})

onUnmounted(() => {
  if (dateTimer) {
    clearInterval(dateTimer)
  }
})
</script>

<template>
  <div class="date-card">
    <span class="date-text">{{ dayOfWeek }}</span>
    <span class="date-number">{{ dayOfMonth }}</span>
  </div>
</template>

<style scoped lang="scss">
.date-card {
  gap: 0.25rem;
  width: 100%;
  height: 100%;
}

.date-text {
  font-size: 5rem;
  color: var(--theme-color-secondary);
}

.date-number {
  line-height: 1;
  font-size: 10rem;
  color: var(--theme-color-primary);
}

/* Media Queries */
@media screen and (min-width: 480px) and (orientation: portrait) {
  .date-text {
    font-size: 3.5rem;
  }

  .date-number {
    font-size: 7rem;
  }
}

@media screen and (min-width: 720px) and (orientation: portrait) {
  .date-text {
    font-size: 6rem;
  }

  .date-number {
    font-size: 10rem;
  }
}

@media screen and (min-width: 800px) and (orientation: landscape) {
  .date-text {
    font-size: 3.4rem;
  }

  .date-number {
    font-size: 7rem;
  }
}

@media screen and (min-width: 1080px) and (orientation: portrait) {
  .date-text {
    font-size: 10rem;
  }

  .date-number {
    font-size: 16rem;
  }
}

@media screen and (min-width: 1280px) and (orientation: landscape) {
  .date-text {
    font-size: 5.5rem;
  }

  .date-number {
    font-size: 13rem;
  }
}

@media screen and (min-width: 1920px) and (orientation: landscape) {
  .date-text {
    font-size: 7rem;
  }

  .date-number {
    font-size: 18rem;
  }
}

@media screen and (min-width: 2160px) and (orientation: portrait) {
  .date-text {
    font-size: 17rem;
  }

  .date-number {
    font-size: 34rem;
  }
}

@media screen and (min-width: 3840px) and (orientation: landscape) {
  .date-text {
    font-size: 17rem;
  }

  .date-number {
    font-size: 34rem;
  }
}

@media screen and (min-width: 4096px) and (orientation: landscape) {
  .date-text {
    font-size: 17rem;
  }

  .date-number {
    font-size: 34rem;
  }
}
</style>
