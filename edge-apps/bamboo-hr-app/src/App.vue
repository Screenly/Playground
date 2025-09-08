<script setup lang="ts">
import { ref, onBeforeMount, onMounted, computed } from 'vue'
import { defineStore } from 'pinia'
import { baseSettingsStoreSetup } from 'blueprint/stores/base-settings-store'

interface Employee {
  id: number
  firstName: string
  lastName: string
  birthdate?: string
  startDate?: string
  avatar?: string | null
  displayName?: string
}

interface Leave {
  id: number
  employee: Employee
  request_type: string
  start_date: string
  end_date: string
}

interface Birthday {
  id: number
  firstName: string
  lastName: string
  birthdate: string
  avatar?: string | null
}

interface Anniversary {
  id: number
  firstName: string
  lastName: string
  startDate: string
  avatar?: string | null
}

const useBaseSettingsStore = defineStore(
  'baseSettingsStore',
  baseSettingsStoreSetup,
)

const baseSettingsStore = useBaseSettingsStore()

// Reactive data
const loading = ref(true)
const currentTime = ref('')
const leaves = ref<Leave[]>([])
const birthdays = ref<Birthday[]>([])
const anniversaries = ref<Anniversary[]>([])

// Mock data for BambooHR
const mockEmployees = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    birthdate: '1990-05-15',
    startDate: '2020-01-15',
    avatar: null,
    displayName: 'John Doe',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    birthdate: '1988-03-22',
    startDate: '2019-06-10',
    avatar: null,
    displayName: 'Jane Smith',
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Johnson',
    birthdate: '1992-12-08',
    startDate: '2021-03-01',
    avatar: null,
    displayName: 'Mike Johnson',
  },
]

const mockLeaves: Leave[] = [
  {
    id: 1,
    employee: mockEmployees[0] as Employee,
    request_type: 'Vacation',
    start_date: '2024-01-15',
    end_date: '2024-01-15',
  },
]

const mockBirthdays: Birthday[] = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Brown',
    birthdate: '1991-01-15',
    avatar: null,
  },
]

const mockAnniversaries: Anniversary[] = [
  {
    id: 1,
    firstName: 'Bob',
    lastName: 'Wilson',
    startDate: '2020-01-15',
    avatar: null,
  },
]

// Computed properties
const brandLogoUrl = computed(() => {
  return baseSettingsStore.brandLogoUrl || '/static/images/Screenly.svg'
})

// Methods
const getLocale = (): string => {
  const overrideLocale = screenly.settings?.override_locale
  if (overrideLocale && typeof overrideLocale === 'string') {
    return overrideLocale
  }
  return (
    (navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language) || 'en'
  )
}

const getTimezone = (): string => {
  const overrideTimezone = screenly.settings?.override_timezone
  if (overrideTimezone && typeof overrideTimezone === 'string') {
    return overrideTimezone
  }
  return Intl.DateTimeFormat().resolvedOptions().timeZone
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

const getInitials = (employee: Employee | Birthday | Anniversary) => {
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
  return true
}

const loadMockData = () => {
  if (!validateApiKey()) {
    return
  }

  leaves.value = mockLeaves
  birthdays.value = mockBirthdays
  anniversaries.value = mockAnniversaries
  loading.value = false
}

onBeforeMount(async () => {
  baseSettingsStore.setupTheme()
  await baseSettingsStore.setupBrandingLogo()
})

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
  loadMockData()
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
          :class="{ 'dashboard-card--loading': loading }"
        >
          <template v-if="loading">
            <li class="dashboard-card__item">Loading...</li>
          </template>
          <template v-else-if="leaves.length === 0">
            <li class="dashboard-card__empty">No upcoming leaves.</li>
          </template>
          <template v-else>
            <li
              v-for="leave in leaves"
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
          :class="{ 'dashboard-card--loading': loading }"
        >
          <template v-if="loading">
            <li class="dashboard-card__item">Loading...</li>
          </template>
          <template v-else-if="birthdays.length === 0">
            <li class="dashboard-card__empty">No upcoming birthdays.</li>
          </template>
          <template v-else>
            <li
              v-for="birthday in birthdays"
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
          :class="{ 'dashboard-card--loading': loading }"
        >
          <template v-if="loading">
            <li class="dashboard-card__item">Loading...</li>
          </template>
          <template v-else-if="anniversaries.length === 0">
            <li class="dashboard-card__empty">No upcoming anniversaries.</li>
          </template>
          <template v-else>
            <li
              v-for="anniversary in anniversaries"
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
