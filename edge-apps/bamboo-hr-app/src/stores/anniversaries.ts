import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { type Employee } from '@/types/employee'
import { fetchEmployeeAvatar } from '@/utils/avatar'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export interface Anniversary {
  id: number
  firstName: string
  lastName: string
  hireDate: string
  avatar?: string | null
}

const anniversariesStoreSetup = () => {
  // State
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const anniversaries: Ref<Anniversary[]> = ref([])

  const setAnniversaryData = async (employees: Employee[]) => {
    try {
      const settingsStore = useSettingsStore()
      const userTimezone = settingsStore.currentTimezone || 'UTC'

      // Get current date in user's timezone for comparison
      const today = dayjs().tz(userTimezone)
      const nextWeek = dayjs().tz(userTimezone).add(7, 'day')

      // Filter employees whose work anniversaries are within the next 7 days
      const upcomingAnniversaries = employees.filter((employee: Employee) => {
        if (!employee.hireDate) return false

        // Parse hireDate as date-only (no timezone conversion for anniversaries)
        // Work anniversaries should be treated as calendar dates, not timestamps
        const hireDate = dayjs(employee.hireDate)

        // Create anniversary dates for this year and next year (keep as date-only)
        const thisYearAnniversary = hireDate.year(today.year())
        const nextYearAnniversary = hireDate.year(today.year() + 1)

        // Check if anniversary is within the next 7 days (this year or next year)
        // Compare with current date in user's timezone
        const isThisYearInRange =
          thisYearAnniversary.isAfter(today.subtract(1, 'day')) &&
          thisYearAnniversary.isBefore(nextWeek.add(1, 'day'))
        const isNextYearInRange =
          nextYearAnniversary.isAfter(today.subtract(1, 'day')) &&
          nextYearAnniversary.isBefore(nextWeek.add(1, 'day'))

        return isThisYearInRange || isNextYearInRange
      })

      const anniversaryData: Anniversary[] = await Promise.all(
        upcomingAnniversaries.map(async (employee: Employee) => {
          const avatarUrl = await fetchEmployeeAvatar(employee.id)

          return {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            hireDate: employee.hireDate,
            avatar: avatarUrl,
          }
        }),
      )

      anniversaries.value = anniversaryData
    } catch {
      setError('Failed to load anniversary data')
    }
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  // Getters
  const hasAnniversaries = () => {
    return anniversaries.value.length > 0
  }

  return {
    // State
    loading,
    error,
    anniversaries,

    // Actions
    setAnniversaryData,
    setLoading,
    setError,

    // Getters
    hasAnniversaries,
  }
}

export const useAnniversariesStore = defineStore(
  'anniversaries',
  anniversariesStoreSetup,
)

export type AnniversariesStore = ReturnType<typeof anniversariesStoreSetup>
