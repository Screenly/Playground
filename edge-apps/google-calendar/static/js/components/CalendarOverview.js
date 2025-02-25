const { defineComponent } = Vue
import { html } from '../utils.js'

export default defineComponent({
  name: 'CalendarOverview',
  props: {
    currentDate: Number,
    currentMonthName: String,
    currentTime: String,
    events: Array
  },
  template: html`
    <div class="secondary-card calendar-overview-card">
      <div class="calendar-top">
        <h1 class="calendar-date">
          <span class="date-number-box">{{ currentDate }}</span>
          {{ currentMonthName }}
        </h1>
        <p class="calendar-event">
          <template v-if="events.length > 0">
            <p v-for="event in events" :key="event">{{ event }}</p>
          </template>
          <template v-else>
            Nothing scheduled on this date
          </template>
        </p>
      </div>
      <div class="calendar-bottom">
        <h1 class="calendar-time">{{ currentTime }}</h1>
      </div>
    </div>
  `
})
