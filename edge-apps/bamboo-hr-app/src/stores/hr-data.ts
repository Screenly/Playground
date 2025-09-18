import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { type Employee } from '@/types/employee'
import { useBirthdaysStore, type Birthday } from '@/stores/birthdays'
import { useAnniversariesStore, type Anniversary } from '@/stores/anniversaries'
import {
  useLeavesStore,
  type Leave,
  type EmployeeOnLeave,
} from '@/stores/leaves'

const hrDataStoreSetup = () => {
  // State
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)
  const employees: Ref<Employee[]> = ref([])

  // Store instances
  const birthdaysStore = useBirthdaysStore()
  const anniversariesStore = useAnniversariesStore()
  const leavesStore = useLeavesStore()

  // Auto-refresh interval
  const REFRESH_INTERVAL = 30000 // 30 seconds
  let refreshInterval: NodeJS.Timeout | null = null

  const fetchEmployeeData = async () => {
    const settingsStore = useSettingsStore()
    const bambooHrApiBaseUrl = `https://${settingsStore.subdomain}.bamboohr.com/api/v1`

    const response = await fetch(
      `${screenly.cors_proxy_url}/${bambooHrApiBaseUrl}/datasets/employee`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(settingsStore.apiKey + ':')}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: [
            'eeid',
            'firstName',
            'lastName',
            'dateOfBirth',
            'hireDate',
            'employeePhoto',
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()

    employees.value = data.data || []
  }

  const refreshData = async () => {
    try {
      await fetchEmployeeData()
      await leavesStore.fetchLeaveData(employees.value)
      await birthdaysStore.setBirthdayData(employees.value)
      await anniversariesStore.setAnniversaryData(employees.value)
    } catch {
      setError('Failed to refresh employee data')
    }
  }

  const startAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval)
    }
    refreshInterval = setInterval(refreshData, REFRESH_INTERVAL)
  }

  const init = async () => {
    setLoading(true)
    setError(null)

    try {
      await refreshData()
      startAutoRefresh()
    } catch {
      setError('Failed to load employee data')
    } finally {
      setLoading(false)
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
    return leavesStore.hasLeaves()
  }

  const hasBirthdays = () => {
    return birthdaysStore.hasBirthdays()
  }

  const hasAnniversaries = () => {
    return anniversariesStore.hasAnniversaries()
  }

  return {
    // State
    loading,
    error,
    employees,

    // Store instances
    birthdaysStore,
    anniversariesStore,
    leavesStore,

    // Actions
    init,
    setLoading,
    setError,

    // Getters
    hasLeaves,
    hasBirthdays,
    hasAnniversaries,
  }
}

export const useHrDataStore = defineStore('hrData', hrDataStoreSetup)

export type HrDataStore = ReturnType<typeof hrDataStoreSetup>

// Export types for use in components
export type { Leave, Birthday, Anniversary, EmployeeOnLeave, Employee }
