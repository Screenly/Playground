const { defineComponent } = Vue
import { html } from '../utils.js'

export default defineComponent({
  name: 'CalendarGrid',
  props: {
    currentMonthName: String,
    currentYear: Number,
    weekDays: Array,
    calendarDays: Array,
    currentDate: Number
  },
  template: html`
    <div class="primary-card">
      <div class="calendar">
        <div class="calendar-header">{{ currentMonthName }} {{ currentYear }}</div>
        <div class="calendar-weekdays">
          <div v-for="day in weekDays">{{ day }}</div>
        </div>
        <div class="calendar-grid">
          <div
            v-for="day in calendarDays"
            :class="[
              'calendar-cell',
              { 'other-month': !day.isCurrentMonth },
              { 'current-day': day.day === currentDate && day.isCurrentMonth }
            ]"
          >
            {{ day.day }}
          </div>
        </div>
      </div>
    </div>
  `
})
