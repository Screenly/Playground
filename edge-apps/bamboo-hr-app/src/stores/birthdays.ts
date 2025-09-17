import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import { type Employee } from '@/types/employee'
import { fetchEmployeeAvatar } from '@/utils/avatar'
import { MAX_ITEMS_PER_COLUMN } from '@/constants'
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

      // Get current date in user's timezone for comparison
      const today = dayjs().tz(userTimezone)
      const nextWeek = dayjs().tz(userTimezone).add(7, 'day')

      // Filter employees whose birthdays are within the next 7 days
      const upcomingBirthdays = employees.filter((employee: Employee) => {
        if (!employee.dateOfBirth) return false

        // Parse dateOfBirth as date-only (no timezone conversion for birthdays)
        // Birthdays should be treated as calendar dates, not timestamps
        const birthDate = dayjs(employee.dateOfBirth)

        // Create birthday dates for this year and next year (keep as date-only)
        const thisYearBirthday = birthDate.year(today.year())
        const nextYearBirthday = birthDate.year(today.year() + 1)

        // Check if birthday is within the next 7 days (this year or next year)
        // Compare with current date in user's timezone
        const isThisYearInRange =
          thisYearBirthday.isAfter(today.subtract(1, 'day')) &&
          thisYearBirthday.isBefore(nextWeek.add(1, 'day'))
        const isNextYearInRange =
          nextYearBirthday.isAfter(today.subtract(1, 'day')) &&
          nextYearBirthday.isBefore(nextWeek.add(1, 'day'))

        return isThisYearInRange || isNextYearInRange
      })

      const birthdayData: Birthday[] = await Promise.all(
        upcomingBirthdays.map(async (employee: Employee) => {
          const avatarUrl = await fetchEmployeeAvatar(employee.id)

          return {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            dateOfBirth: employee.dateOfBirth,
            avatar: avatarUrl,
          }
        }),
      )

      birthdays.value = birthdayData.slice(0, MAX_ITEMS_PER_COLUMN)
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
