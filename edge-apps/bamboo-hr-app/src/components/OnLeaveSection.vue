<script setup lang="ts">
import { useHrDataStore, type Leave } from '@/stores/hr-data'

const hrDataStore = useHrDataStore()

const getInitials = (employee: { firstName: string; lastName: string }) => {
  return `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`
}

const formatLeaveDate = (leave: Leave) => {
  if (!leave.start_date || !leave.end_date) return 'No date'

  const startDate = new Date(leave.start_date).toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const endDate = new Date(leave.end_date).toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  if (startDate === endDate) {
    return startDate
  }

  return `${startDate} - ${endDate}`
}
</script>

<template>
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
</template>

<style scoped lang="scss"></style>
