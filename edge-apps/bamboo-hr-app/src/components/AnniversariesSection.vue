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
</script>

<template>
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
</template>

<style scoped lang="scss"></style>
