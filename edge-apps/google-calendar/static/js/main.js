const { createApp, ref, defineComponent } = Vue
import {
  html,
  getCurrentFormattedTime,
  generateCalendarDays
} from './utils.js'
import { fetchCalendarEvents } from './googleCalendar.js'

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
    const events = ref([])

    // Fetch calendar events
    const updateEvents = async () => {
      const fetchedEvents = await fetchCalendarEvents()
      events.value = fetchedEvents
    }

    // Initial events fetch
    updateEvents()

    // Update time every minute
    setInterval(() => {
      currentTime.value = getCurrentFormattedTime()
    }, 60 * 1000)

    // Update events every second
    setInterval(updateEvents, 1000)

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
