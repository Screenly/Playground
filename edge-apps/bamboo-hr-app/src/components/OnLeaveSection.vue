<script setup lang="ts">
import { useHrDataStore } from '@/stores/hr-data'
import { type EmployeeOnLeave } from '@/stores/leaves'
import { getInitials } from '@/utils/avatar'

const hrDataStore = useHrDataStore()

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
    <h2 class="dashboard-card-title">🏖️ On Leave</h2>
    <ul
      class="dashboard-card-list"
      :class="{ 'dashboard-card-loading': hrDataStore.loading }"
    >
      <template v-if="hrDataStore.loading">
        <li class="dashboard-card-item">Loading...</li>
      </template>
      <template v-else-if="!hrDataStore.hasLeaves()">
        <li class="dashboard-card-empty">No upcoming leaves.</li>
      </template>
      <template v-else>
        <li
          v-for="leave in hrDataStore.leavesStore.employeesOnLeave"
          :key="leave.employeeId"
          class="dashboard-card-item"
        >
          <div class="employee-card">
            <template v-if="leave.avatar">
              <img
                :src="leave.avatar"
                :alt="`${leave.name}`"
                class="employee-card-avatar"
              />
            </template>
            <template v-else>
              <div class="employee-card-avatar-placeholder">
                {{ getInitials(leave.name) }}
              </div>
            </template>
            <div class="employee-card-info">
              <div class="employee-card-name">
                {{ leave.name }}
              </div>
              <div class="employee-card-details">
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
