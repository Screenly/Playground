<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'

import screenlyLogo from 'blueprint/assets/images/screenly.svg'
import { useSettingsStore } from '@/stores/settings'
import {
  useHrDataStore,
  type MockEmployee,
  type Leave,
  type Birthday,
  type Anniversary,
} from '@/stores/hr-data'

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()
const settingsStore = useSettingsStore()
const hrDataStore = useHrDataStore()

// Reactive data
const currentTime = ref('')

// Computed properties
const brandLogoUrl = computed(() => {
  return baseSettingsStore.brandLogoUrl || screenlyLogo
})

// Methods
const getLocale = (): string => {
  return settingsStore.getLocale()
}

const getTimezone = (): string => {
  return settingsStore.getTimezone()
}

const updateClock = () => {
  const now = new Date()
  const locale = getLocale()
  const timezone = getTimezone()

  const time = now.toLocaleTimeString(locale, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  })
  const date = now.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
  currentTime.value = `${time} — ${date}`
}

const getInitials = (employee: MockEmployee | Birthday | Anniversary) => {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
}

const formatLeaveDate = (leave: Leave) => {
  if (!leave.start_date || !leave.end_date) return 'No date'

  const locale = getLocale()
  const timezone = getTimezone()

  const startDate = new Date(leave.start_date).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
  const endDate = new Date(leave.end_date).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })

  if (startDate === endDate) {
    return startDate
  }

  return `${startDate} - ${endDate}`
}

const formatUpcomingDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const currentYear = today.getFullYear()
  date.setFullYear(currentYear)

  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth()
  ) {
    return 'Today'
  } else if (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth()
  ) {
    return 'Tomorrow'
  }

  const locale = getLocale()
  const timezone = getTimezone()

  return date.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })
}

const formatAnniversaryText = (startDate: string) => {
  const start = new Date(startDate)
  const today = new Date()
  let years = today.getFullYear() - start.getFullYear()

  if (
    today.getMonth() < start.getMonth() ||
    (today.getMonth() === start.getMonth() && today.getDate() < start.getDate())
  ) {
    years--
  }

  const dateText = formatUpcomingDate(startDate)
  return `${years} Year${years !== 1 ? 's' : ''} Anniversary (${dateText})`
}

const validateApiKey = () => {
  return settingsStore.hasValidApiKey()
}

const loadMockData = () => {
  if (!validateApiKey()) {
    return
  }

  hrDataStore.loadMockData()
}

onBeforeMount(async () => {
  settingsStore.init()
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(async () => {
  updateClock()
  setInterval(updateClock, 1000)
  loadMockData()

  await hrDataStore.init()
  screenly.signalReadyForRendering()
})
</script>

<template>
  <div class="app">
    <header class="app__header">
      <div class="app__header-left">
        <div class="app__header-title">BambooHR Dashboard</div>
        <div class="app__header-screenly">Powered by Screenly</div>
      </div>
      <div class="app__header-right">
        <div class="app__clock">{{ currentTime }}</div>
        <img :src="brandLogoUrl" alt="Brand Logo" class="brand-logo" />
      </div>
    </header>

    <main class="app__main">
      <!-- On Leave Section -->
      <section class="dashboard-card">
        <h2 class="dashboard-card__title">🏖️ On Leave Today</h2>
        <ul
          class="dashboard-card__list"
          :class="{ 'dashboard-card--loading': hrDataStore.loading }"
        >
          <template v-if="hrDataStore.loading">
            <li class="dashboard-card__item">Loading...</li>
          </template>
          <template v-else-if="!hrDataStore.hasLeaves()">
            <li class="dashboard-card__empty">No upcoming leaves.</li>
          </template>
          <template v-else>
            <li
              v-for="leave in hrDataStore.leaves"
              :key="leave.id"
              class="dashboard-card__item"
            >
              <div class="employee-card">
                <template v-if="leave.employee.avatar">
                  <img
                    :src="leave.employee.avatar"
                    :alt="`${leave.employee.firstName} ${leave.employee.lastName}`"
                    class="employee-card__avatar"
                  />
                </template>
                <template v-else>
                  <div class="employee-card__avatar-placeholder">
                    {{ getInitials(leave.employee) }}
                  </div>
                </template>
                <div class="employee-card__info">
                  <div class="employee-card__name">
                    {{ leave.employee.firstName }} {{ leave.employee.lastName }}
                  </div>
                  <div class="employee-card__details">
                    <div>{{ formatLeaveDate(leave) }}</div>
                    <div>{{ leave.request_type }}</div>
                  </div>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </section>

      <!-- Birthdays Section -->
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
              v-for="birthday in hrDataStore.birthdays"
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
                    {{ formatUpcomingDate(birthday.birthdate) }}
                  </div>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </section>

      <!-- Anniversaries Section -->
      <section class="dashboard-card">
        <h2 class="dashboard-card__title">🎉 Anniversaries</h2>
        <ul
          class="dashboard-card__list"
          :class="{ 'dashboard-card--loading': hrDataStore.loading }"
        >
          <template v-if="hrDataStore.loading">
            <li class="dashboard-card__item">Loading...</li>
          </template>
          <template v-else-if="!hrDataStore.hasAnniversaries()">
            <li class="dashboard-card__empty">No upcoming anniversaries.</li>
          </template>
          <template v-else>
            <li
              v-for="anniversary in hrDataStore.anniversaries"
              :key="anniversary.id"
              class="dashboard-card__item"
            >
              <div class="employee-card">
                <template v-if="anniversary.avatar">
                  <img
                    :src="anniversary.avatar"
                    :alt="`${anniversary.firstName} ${anniversary.lastName}`"
                    class="employee-card__avatar"
                  />
                </template>
                <template v-else>
                  <div class="employee-card__avatar-placeholder">
                    {{ getInitials(anniversary) }}
                  </div>
                </template>
                <div class="employee-card__info">
                  <div class="employee-card__name">
                    {{ anniversary.firstName }} {{ anniversary.lastName }}
                  </div>
                  <div class="employee-card__details">
                    {{ formatAnniversaryText(anniversary.startDate) }}
                  </div>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss"></style>
