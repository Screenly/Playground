const { createApp, ref } = Vue

const getCurrentFormattedTime = () => {
  return new Date().toLocaleTimeString(
    'en-US',
    {
      hour: '2-digit',
      minute: '2-digit',
      // TODO: The value of hour12 should be depending on the locale given
      // the coordinates of the device.
      hour12: true
    }
  )
}

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year, month) => {
  // Sunday is 0, which is what we want now (Sunday-first format)
  return new Date(year, month, 1).getDay()
}

const generateCalendarDays = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const days = []

  // Previous month's days
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false
    })
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true
    })
  }

  // Calculate remaining days needed to complete the last row
  const totalDaysSoFar = days.length
  const remainingDaysInLastRow = 7 - (totalDaysSoFar % 7)
  const needsExtraRow = remainingDaysInLastRow < 7

  // Add next month's days only for the last row if needed
  for (let i = 1; i <= (needsExtraRow ? remainingDaysInLastRow : 0); i++) {
    days.push({
      day: i,
      isCurrentMonth: false
    })
  }

  return days
}

document.addEventListener('DOMContentLoaded', () => {
  const app = createApp({
    setup() {
      const now = new Date()
      const currentYear = ref(now.getFullYear())
      const currentMonth = ref(now.getMonth())
      const currentDate = ref(now.getDate())
      const currentMonthName = ref(now.toLocaleString('default', { month: 'long' }))
      const currentTime = ref(getCurrentFormattedTime())
      const calendarDays = ref(generateCalendarDays(currentYear.value, currentMonth.value))
      const weekDays = ref(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])

      // TODO: Fetch the events from the Google Calendar API.
      // Limit to 5 events for better visibility in kiosk mode
      const allEvents = [
        'Backlog Grooming',
        'Sprint Planning',
        'Daily Scrum',
        'Sprint Review',
        'Sprint Retrospective',
      ]
      const events = ref(allEvents.slice(0, 5))

      // Update time every minutes
      setInterval(() => {
        currentTime.value = getCurrentFormattedTime()
      }, 60 * 1000)

      return {
        currentYear,
        currentMonth,
        currentDate,
        currentMonthName,
        currentTime,
        calendarDays,
        weekDays,
        events,
      }
    },
    mounted() {
      try {
        screenly.signalReadyForRendering()
      } catch (error) {
        console.error('Error signaling ready for rendering:', error)
      }
    }
  })

  app.mount('#app')
})
