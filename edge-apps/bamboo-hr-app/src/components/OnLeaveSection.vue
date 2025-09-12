<script setup lang="ts">
import { useHrDataStore } from '@/stores/hr-data'
import { type EmployeeOnLeave } from '@/stores/leaves'

const hrDataStore = useHrDataStore()

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]?.charAt(0) ?? ''
  const firstName = parts.slice(0, -1).join(' ')
  const lastName = parts[parts.length - 1]
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`
}

const formatLeaveDate = (leave: EmployeeOnLeave) => {
  if (!leave.start || !leave.end) return 'No date'

  const startDate = new Date(leave.start).toLocaleDateString('en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const endDate = new Date(leave.end).toLocaleDateString('en', {
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
          v-for="leave in hrDataStore.leavesStore.employeesOnLeave"
          :key="leave.employeeId"
          class="dashboard-card__item"
        >
          <div class="employee-card">
            <template v-if="leave.avatar">
              <img
                :src="leave.avatar"
                :alt="`${leave.name}`"
                class="employee-card__avatar"
              />
            </template>
            <template v-else>
              <div class="employee-card__avatar-placeholder">
                {{ getInitials(leave.name) }}
              </div>
            </template>
            <div class="employee-card__info">
              <div class="employee-card__name">
                {{ leave.name }}
              </div>
              <div class="employee-card__details">
                <div>{{ formatLeaveDate(leave) }}</div>
                <div>{{ leave.type }}</div>
              </div>
            </div>
          </div>
        </li>
      </template>
    </ul>
  </section>
</template>

<style scoped lang="scss"></style>
