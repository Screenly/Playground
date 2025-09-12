<script setup lang="ts">
import { useHrDataStore } from '@/stores/hr-data'
import { useSettingsStore } from '@/stores/settings'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc)
dayjs.extend(timezone)

const hrDataStore = useHrDataStore()
const settingsStore = useSettingsStore()

const getInitials = (employee: { firstName: string; lastName: string }) => {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
}

const formatUpcomingDate = (dateStr: string) => {
  const userLocale = settingsStore.getLocale() || 'en'

  // Parse the date as a date-only value (no timezone conversion for birthdays)
  // Birthdays should be treated as calendar dates, not timestamps
  const birthDate = dayjs(dateStr)

  // Get current date in user's timezone for comparison
  const userTimezone = settingsStore.getTimezone() || 'UTC'
  const today = dayjs().tz(userTimezone)
  const tomorrow = dayjs().tz(userTimezone).add(1, 'day')

  // Create birthday for current year (keep it as a date-only value)
  const thisYearBirthday = birthDate.year(today.year())

  // Check if birthday is today or tomorrow (compare date parts only)
  if (thisYearBirthday.isSame(today, 'day')) {
    return 'Today'
  } else if (thisYearBirthday.isSame(tomorrow, 'day')) {
    return 'Tomorrow'
  }

  // Format the date in user's locale
  return thisYearBirthday.locale(userLocale).format('ddd, MMM D')
}
</script>

<template>
  <section class="dashboard-card">
    <h2 class="dashboard-card__title">🎂 Birthdays</h2>
    <ul
      class="dashboard-card__list"
      :class="{ 'dashboard-card--loading': hrDataStore.loading }"
    >
      <template v-if="hrDataStore.loading">
        <li class="dashboard-card__item">Loading...</li>
      </template>
      <template v-else-if="!hrDataStore.hasBirthdays()">
        <li class="dashboard-card__empty">No upcoming birthdays.</li>
      </template>
      <template v-else>
        <li
          v-for="birthday in hrDataStore.birthdaysStore.birthdays"
          :key="birthday.id"
          class="dashboard-card__item"
        >
          <div class="employee-card">
            <template v-if="birthday.avatar">
              <img
                :src="birthday.avatar"
                :alt="`${birthday.firstName} ${birthday.lastName}`"
                class="employee-card__avatar"
              />
            </template>
            <template v-else>
              <div class="employee-card__avatar-placeholder">
                {{ getInitials(birthday) }}
              </div>
            </template>
            <div class="employee-card__info">
              <div class="employee-card__name">
                {{ birthday.firstName }} {{ birthday.lastName }}
              </div>
              <div class="employee-card__details">
                {{ formatUpcomingDate(birthday.dateOfBirth) }}
              </div>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </section>
</template>

<style scoped lang="scss"></style>
