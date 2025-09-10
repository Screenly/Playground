<script setup lang="ts">
import { useHrDataStore } from '@/stores/hr-data'

const hrDataStore = useHrDataStore()

const getInitials = (employee: { firstName: string; lastName: string }) => {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
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

  return date.toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
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
</template>

<style scoped lang="scss"></style>
