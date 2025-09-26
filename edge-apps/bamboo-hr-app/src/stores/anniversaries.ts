import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { type Employee } from '@/types/employee'
import { MAX_ITEMS_PER_COLUMN, DEFAULT_EMPLOYEE_PHOTO_URL } from '@/constants'
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

      // Get current date (start of day) in user's timezone for comparison
      const today = dayjs().tz(userTimezone).startOf('day')
      const tomorrow = today.add(1, 'day')

      // Filter employees whose work anniversaries are today or tomorrow
      const upcomingAnniversaries = employees.filter((employee: Employee) => {
        if (!employee.hireDate) return false

        // Parse hireDate as date-only (no timezone conversion for anniversaries)
        // Work anniversaries should be treated as calendar dates, not timestamps
        const hireDate = dayjs(employee.hireDate)

        // Create anniversary date for this year (keep as date-only)
        const thisYearAnniversary = hireDate.year(today.year())

        const isToday = thisYearAnniversary.isSame(today, 'day')
        const isTomorrow = thisYearAnniversary.isSame(tomorrow, 'day')

        return isToday || isTomorrow
      })

      const anniversaryData: Anniversary[] = upcomingAnniversaries.map(
        (employee: Employee) => {
          const avatar =
            employee.employeePhoto === DEFAULT_EMPLOYEE_PHOTO_URL
              ? null
              : employee.employeePhoto

          return {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            hireDate: employee.hireDate,
            avatar,
          }
        },
      )

      // Sort with today's anniversaries first, then tomorrow's; tie-break by last then first name
      const sorted = anniversaryData.sort((a, b) => {
        const aAnniv = dayjs(a.hireDate).year(today.year())
        const bAnniv = dayjs(b.hireDate).year(today.year())

        const rank = (d: dayjs.Dayjs) => (d.isSame(today, 'day') ? 0 : 1)
        const rankDiff = rank(aAnniv) - rank(bAnniv)
        if (rankDiff !== 0) return rankDiff

        const lastNameDiff = a.lastName.localeCompare(b.lastName)
        if (lastNameDiff !== 0) return lastNameDiff
        return a.firstName.localeCompare(b.firstName)
      })

      anniversaries.value = sorted.slice(0, MAX_ITEMS_PER_COLUMN)
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
