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

export interface Birthday {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  avatar?: string | null
}

const birthdaysStoreSetup = () => {
  // State
  const loading: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const birthdays: Ref<Birthday[]> = ref([])

  const setBirthdayData = async (employees: Employee[]) => {
    try {
      const settingsStore = useSettingsStore()
      const userTimezone = settingsStore.currentTimezone || 'UTC'

      // Get current date (start of day) in user's timezone for comparison
      const today = dayjs().tz(userTimezone).startOf('day')
      const tomorrow = today.add(1, 'day')

      // Keep only birthdays that are today or tomorrow
      const upcomingBirthdays = employees.filter((employee: Employee) => {
        if (!employee.dateOfBirth) return false

        // Parse dateOfBirth as date-only (no timezone conversion for birthdays)
        // Birthdays should be treated as calendar dates, not timestamps
        const birthDate = dayjs(employee.dateOfBirth)

        // Create birthday date for this year (keep as date-only)
        const thisYearBirthday = birthDate.year(today.year())

        const isToday = thisYearBirthday.isSame(today, 'day')
        const isTomorrow = thisYearBirthday.isSame(tomorrow, 'day')

        return isToday || isTomorrow
      })

      const birthdayData: Birthday[] = upcomingBirthdays.map(
        (employee: Employee) => {
          const avatar =
            employee.employeePhoto === DEFAULT_EMPLOYEE_PHOTO_URL
              ? null
              : employee.employeePhoto

          return {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            dateOfBirth: employee.dateOfBirth,
            avatar,
          }
        },
      )

      // Sort with today's birthdays first, then tomorrow's; tie-break by last then first name
      const sorted = birthdayData.sort((a, b) => {
        const aBirth = dayjs(a.dateOfBirth).year(today.year())
        const bBirth = dayjs(b.dateOfBirth).year(today.year())

        const rank = (d: dayjs.Dayjs) => (d.isSame(today, 'day') ? 0 : 1)
        const rankDiff = rank(aBirth) - rank(bBirth)
        if (rankDiff !== 0) return rankDiff

        const lastNameDiff = a.lastName.localeCompare(b.lastName)
        if (lastNameDiff !== 0) return lastNameDiff
        return a.firstName.localeCompare(b.firstName)
      })

      birthdays.value = sorted.slice(0, MAX_ITEMS_PER_COLUMN)
    } catch {
      setError('Failed to load birthday data')
    }
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  // Getters
  const hasBirthdays = () => {
    return birthdays.value.length > 0
  }

  return {
    // State
    loading,
    error,
    birthdays,

    // Actions
    setBirthdayData,
    setLoading,
    setError,

    // Getters
    hasBirthdays,
  }
}

export const useBirthdaysStore = defineStore('birthdays', birthdaysStoreSetup)

export type BirthdaysStore = ReturnType<typeof birthdaysStoreSetup>
