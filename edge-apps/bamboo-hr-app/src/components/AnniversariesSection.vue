<script setup lang="ts">
import { useHrDataStore } from '@/stores/hr-data'
import { useSettingsStore } from '@/stores/settings'
import { getInitialsFromNames } from '@/utils/avatar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)

const hrDataStore = useHrDataStore()
const settingsStore = useSettingsStore()

const formatUpcomingDate = (dateStr: string) => {
  // Parse the date as a date-only value (no timezone conversion for anniversaries)
  // Work anniversaries should be treated as calendar dates, not timestamps
  const anniversaryDate = dayjs(dateStr)

  // Get current date in user's timezone for comparison
  const today = dayjs().tz(settingsStore.currentTimezone)
  const tomorrow = dayjs().tz(settingsStore.currentTimezone).add(1, 'day')

  // Create anniversary for current year (keep it as a date-only value)
  const thisYearAnniversary = anniversaryDate.year(today.year())

  // Check if anniversary is today or tomorrow (compare date parts only)
  if (thisYearAnniversary.isSame(today, 'day')) {
    return 'Today'
  } else if (thisYearAnniversary.isSame(tomorrow, 'day')) {
    return 'Tomorrow'
  }

  // Format the date in user's locale
  return thisYearAnniversary
    .locale(settingsStore.currentLocale)
    .format('ddd, MMM D')
}

const formatAnniversaryText = (hireDate: string) => {
  const today = dayjs().tz(settingsStore.currentTimezone)

  // Parse hireDate as date-only (no timezone conversion)
  const hireDateParsed = dayjs(hireDate)

  // Calculate years of service
  let years = today.year() - hireDateParsed.year()

  // Adjust if the anniversary hasn't occurred yet this year
  const thisYearAnniversary = hireDateParsed.year(today.year())
  if (today.isBefore(thisYearAnniversary)) {
    years--
  }

  const dateText = formatUpcomingDate(hireDate)
  return `${years} Year${years !== 1 ? 's' : ''} Anniversary (${dateText})`
}
</script>

<template>
  <section class="dashboard-card">
    <h2 class="dashboard-card-title">🎉 Anniversaries</h2>
    <ul
      class="dashboard-card-list"
      :class="{ 'dashboard-card-loading': hrDataStore.loading }"
    >
      <template v-if="hrDataStore.loading">
        <li class="dashboard-card-item">Loading...</li>
      </template>
      <template v-else-if="!hrDataStore.hasAnniversaries()">
        <li class="dashboard-card-empty">No upcoming anniversaries.</li>
      </template>
      <template v-else>
        <li
          v-for="anniversary in hrDataStore.anniversariesStore.anniversaries"
          :key="anniversary.id"
          class="dashboard-card-item"
        >
          <div class="employee-card">
            <template v-if="anniversary.avatar">
              <img
                :src="anniversary.avatar"
                :alt="`${anniversary.firstName} ${anniversary.lastName}`"
                class="employee-card-avatar"
              />
            </template>
            <template v-else>
              <div class="employee-card-avatar-placeholder">
                {{
                  getInitialsFromNames(
                    anniversary.firstName,
                    anniversary.lastName,
                  )
                }}
              </div>
            </template>
            <div class="employee-card-info">
              <div class="employee-card-name">
                {{ anniversary.firstName }} {{ anniversary.lastName }}
              </div>
              <div class="employee-card-details">
                {{ formatAnniversaryText(anniversary.hireDate) }}
              </div>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </section>
</template>

<style scoped lang="scss"></style>
