const { createApp, ref, defineComponent } = Vue
import {
  html,
  getCurrentFormattedTime,
  generateCalendarDays
} from './utils.js'

// Import components
import CalendarOverview from './components/CalendarOverview.js'
import InfoCard from './components/InfoCard.js'
import CalendarGrid from './components/CalendarGrid.js'

// Create root component
const App = defineComponent({
  components: {
    CalendarOverview,
    InfoCard,
    CalendarGrid
  },
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
      'Daily Scrum',
      'Sprint Review'
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
      events
    }
  },
  template: html`
    <div class="main-container">
      <div class="secondary-container">
        <div class="row-container">
          <calendar-overview
            :current-date="currentDate"
            :current-month-name="currentMonthName"
            :current-time="currentTime"
            :events="events"
          />
        </div>
        <div class="row-container">
          <info-card />
        </div>
      </div>
      <calendar-grid
        :current-month-name="currentMonthName"
        :current-year="currentYear"
        :week-days="weekDays"
        :calendar-days="calendarDays"
        :current-date="currentDate"
      />
    </div>
  `,
  mounted() {
    try {
      screenly.signalReadyForRendering()
    } catch (error) {
      console.error('Error signaling ready for rendering:', error)
    }
  }
})

// Mount the application
document.addEventListener('DOMContentLoaded', () => {
  createApp(App).mount('#app')
})
