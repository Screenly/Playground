import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { type Employee } from '@/types/employee'
import { MAX_ITEMS_PER_COLUMN, DEFAULT_EMPLOYEE_PHOTO_URL } from '@/constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

export interface Leave {
  id: number
  name: string
  start: string
  end: string
  type: string
}

export interface EmployeeOnLeave {
  employeeId: number
  name: string
  start: string
  end: string
  type: string
  avatar?: string | null
}

const leavesStoreSetup = () => {
  // State
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const employeesOnLeave: Ref<EmployeeOnLeave[]> = ref([])

  const getLeaveType = (type: string) => {
    switch (type) {
      default:
        return 'Time Off'
    }
  }

  const fetchLeaveData = async (employees: Employee[] = []) => {
    try {
      const settingsStore = useSettingsStore()
      const userTimezone = settingsStore.currentTimezone || 'UTC'
      const bambooHrApiBaseUrl = `https://${settingsStore.subdomain}.bamboohr.com/api/v1`

      // Get current date (start of day) in user's timezone for comparison
      const today = dayjs().tz(userTimezone).startOf('day')

      const response = await fetch(
        `${screenly.cors_proxy_url}/${bambooHrApiBaseUrl}/time_off/whos_out`,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${btoa(settingsStore.apiKey + ':')}`,
            Accept: 'application/json',
          },
        },
      )

      const data = await response.json()

      // Filter to only show people on leave for today
      const todayLeaves = data.filter((item: Leave) => {
        const startDate = dayjs(item.start).tz(userTimezone).startOf('day')
        const endDate = dayjs(item.end).tz(userTimezone).startOf('day')

        // Check if today falls within the leave period (inclusive)
        return today.isSameOrAfter(startDate) && today.isSameOrBefore(endDate)
      })

      const employeesOnLeaveData: EmployeeOnLeave[] = todayLeaves.map(
        (item: EmployeeOnLeave) => {
          const employee = employees.find(
            (emp) => Number(emp.eeid) === item.employeeId,
          )
          let avatar = null

          if (employee) {
            // Employee found - check if it's the default photo
            if (employee.employeePhoto === DEFAULT_EMPLOYEE_PHOTO_URL) {
              avatar = null // Use initials fallback
            } else {
              avatar = employee.employeePhoto // Use real photo
            }
          } else {
            // Employee not found - use initials fallback
            avatar = null
          }

          return {
            employeeId: item.employeeId,
            name: item.name,
            start: item.start,
            end: item.end,
            type: getLeaveType(item.type),
            avatar,
          }
        },
      )

      employeesOnLeave.value = employeesOnLeaveData.slice(
        0,
        MAX_ITEMS_PER_COLUMN,
      )
    } catch {
      setError('Failed to load leave data')
    }
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  // Getters
  const hasLeaves = () => {
    return employeesOnLeave.value.length > 0
  }

  return {
    // State
    loading,
    error,
    employeesOnLeave,

    // Actions
    fetchLeaveData,
    setLoading,
    setError,

    // Getters
    hasLeaves,
  }
}

export const useLeavesStore = defineStore('leaves', leavesStoreSetup)

export type LeavesStore = ReturnType<typeof leavesStoreSetup>
