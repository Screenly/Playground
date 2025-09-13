<script setup lang="ts">
import { useHrDataStore } from '@/stores/hr-data'
import { useSettingsStore } from '@/stores/settings'
import { getInitialsFromNames } from '@/utils/avatar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc)
dayjs.extend(timezone)

const hrDataStore = useHrDataStore()
const settingsStore = useSettingsStore()

const formatUpcomingDate = (dateStr: string) => {
  // Parse the date as a date-only value (no timezone conversion for birthdays)
  // Birthdays should be treated as calendar dates, not timestamps
  const birthDate = dayjs(dateStr)

  // Get current date in user's timezone for comparison
  const today = dayjs().tz(settingsStore.currentTimezone)
  const tomorrow = dayjs().tz(settingsStore.currentTimezone).add(1, 'day')

  // Create birthday for current year (keep it as a date-only value)
  const thisYearBirthday = birthDate.year(today.year())

  // Check if birthday is today or tomorrow (compare date parts only)
  if (thisYearBirthday.isSame(today, 'day')) {
    return 'Today'
  } else if (thisYearBirthday.isSame(tomorrow, 'day')) {
    return 'Tomorrow'
  }

  // Format the date in user's locale
  return thisYearBirthday
    .locale(settingsStore.currentLocale)
    .format('ddd, MMM D')
}
</script>

<template>
  <section class="dashboard-card">
    <h2 class="dashboard-card-title">🎂 Birthdays</h2>
    <ul
      class="dashboard-card-list"
      :class="{ 'dashboard-card-loading': hrDataStore.loading }"
    >
      <template v-if="hrDataStore.loading">
        <li class="dashboard-card-item">Loading...</li>
      </template>
      <template v-else-if="!hrDataStore.hasBirthdays()">
        <li class="dashboard-card-empty">No upcoming birthdays.</li>
      </template>
      <template v-else>
        <li
          v-for="birthday in hrDataStore.birthdaysStore.birthdays"
          :key="birthday.id"
          class="dashboard-card-item"
        >
          <div class="employee-card">
            <template v-if="birthday.avatar">
              <img
                :src="birthday.avatar"
                :alt="`${birthday.firstName} ${birthday.lastName}`"
                class="employee-card-avatar"
              />
            </template>
            <template v-else>
              <div class="employee-card-avatar-placeholder">
                {{
                  getInitialsFromNames(birthday.firstName, birthday.lastName)
                }}
              </div>
            </template>
            <div class="employee-card-info">
              <div class="employee-card-name">
                {{ birthday.firstName }} {{ birthday.lastName }}
              </div>
              <div class="employee-card-details">
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
