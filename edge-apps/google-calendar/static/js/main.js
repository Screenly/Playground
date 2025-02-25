const { createApp, ref } = Vue

const getCurrentFormattedTime = () => {
  return new Date().toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
  )
}

document.addEventListener('DOMContentLoaded', () => {
  const app = createApp({
    setup() {
      const now = new Date()
      const currentDate = ref(now.getDate())
      const currentMonth = ref(now.toLocaleString('default', { month: 'long' }))
      const currentTime = ref(getCurrentFormattedTime())
      const events = ref([
        'Backlog Grooming',
        'Sprint Planning',
      ])

      // Update time every minutes
      setInterval(() => {
        currentTime.value = getCurrentFormattedTime()
      }, 60 * 1000)


      return {
        currentDate,
        currentMonth,
        currentTime,
        events,
      }
    }
  })

  app.mount('#app')
})
