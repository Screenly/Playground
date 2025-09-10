import { type Ref, ref } from 'vue'
import { defineStore } from 'pinia'
import { useSettingsStore } from '@/stores/settings'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

interface MockEmployee {
  id: number
  firstName: string
  lastName: string
  birthdate?: string
  startDate?: string
  avatar?: string | null
  displayName?: string
}

interface Leave {
  id: number
  employee: MockEmployee
  request_type: string
  start_date: string
  end_date: string
}

interface Birthday {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  avatar?: string | null
}

interface Anniversary {
  id: number
  firstName: string
  lastName: string
  startDate: string
  avatar?: string | null
}

interface Employee {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  hireDate: string
}

const hrDataStoreSetup = () => {
  // State
  const loading: Ref<boolean> = ref(true)
  const error: Ref<string | null> = ref(null)

  // HR Data
  const leaves: Ref<Leave[]> = ref([])
  const birthdays: Ref<Birthday[]> = ref([])
  const anniversaries: Ref<Anniversary[]> = ref([])
  const employees: Ref<Employee[]> = ref([])

  // Mock data for development/testing
  const mockEmployees: MockEmployee[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      birthdate: '1990-05-15',
      startDate: '2020-01-15',
      avatar: null,
      displayName: 'John Doe',
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      birthdate: '1988-03-22',
      startDate: '2019-06-10',
      avatar: null,
      displayName: 'Jane Smith',
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Johnson',
      birthdate: '1992-12-08',
      startDate: '2021-03-01',
      avatar: null,
      displayName: 'Mike Johnson',
    },
  ]

  const mockLeaves: Leave[] = [
    {
      id: 1,
      employee: mockEmployees[0] as MockEmployee,
      request_type: 'Vacation',
      start_date: '2024-01-15',
      end_date: '2024-01-15',
    },
  ]

  const mockAnniversaries: Anniversary[] = [
    {
      id: 1,
      firstName: 'Bob',
      lastName: 'Wilson',
      startDate: '2020-01-15',
      avatar: null,
    },
  ]

  const fetchEmployeeData = async () => {
    const settingsStore = useSettingsStore()
    const bambooHrApiBaseUrl = `https://${settingsStore.subdomain}.bamboohr.com/api/v1`

    const response = await fetch(
      `${screenly.cors_proxy_url}/${bambooHrApiBaseUrl}/reports/custom`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(settingsStore.apiKey + ':')}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: ['firstName', 'lastName', 'dateOfBirth', 'hireDate'],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()
    employees.value = data.employees || []
  }

  const setBirthdayData = async () => {
    try {
      const settingsStore = useSettingsStore()
      const userTimezone = settingsStore.getTimezone() || 'UTC'

      // Get current date in user's timezone for comparison
      const today = dayjs().tz(userTimezone)
      const nextWeek = dayjs().tz(userTimezone).add(7, 'day')

      // Filter employees whose birthdays are within the next 7 days
      const upcomingBirthdays = employees.value.filter((employee: Employee) => {
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

      const birthdayData: Birthday[] = upcomingBirthdays.map(
        (employee: Employee) => ({
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          dateOfBirth: employee.dateOfBirth,
          avatar: null,
        }),
      )

      birthdays.value = birthdayData
    } catch {
      setError('Failed to load birthday data')
    }
  }

  const init = async () => {
    setLoading(true)
    setError(null)

    try {
      await fetchEmployeeData()
      await setBirthdayData()
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

  const setLeaves = (newLeaves: Leave[]) => {
    leaves.value = newLeaves
  }

  const setAnniversaries = (newAnniversaries: Anniversary[]) => {
    anniversaries.value = newAnniversaries
  }

  const loadMockData = () => {
    setLoading(true)
    setError(null)

    try {
      setLeaves(mockLeaves)
      setAnniversaries(mockAnniversaries)
    } catch (err) {
      setError('Failed to load mock data')
      console.error('Error loading mock data:', err)
    } finally {
      setLoading(false)
    }
  }

  const clearData = () => {
    setLeaves([])
    birthdays.value = []
    setAnniversaries([])
    setError(null)
  }

  const refreshData = () => {
    loadMockData()
  }

  // Getters
  const hasLeaves = () => {
    return leaves.value.length > 0
  }

  const hasBirthdays = () => {
    return birthdays.value.length > 0
  }

  const hasAnniversaries = () => {
    return anniversaries.value.length > 0
  }

  const hasAnyData = () => {
    return hasLeaves() || hasBirthdays() || hasAnniversaries()
  }

  const getLeavesCount = () => {
    return leaves.value.length
  }

  const getBirthdaysCount = () => {
    return birthdays.value.length
  }

  const getAnniversariesCount = () => {
    return anniversaries.value.length
  }

  const getTotalCount = () => {
    return getLeavesCount() + getBirthdaysCount() + getAnniversariesCount()
  }

  return {
    // State
    loading,
    error,
    leaves,
    birthdays,
    anniversaries,
    employees,

    // Actions
    init,
    setLoading,
    setError,
    setLeaves,
    setAnniversaries,
    loadMockData,
    clearData,
    refreshData,

    // Getters
    hasLeaves,
    hasBirthdays,
    hasAnniversaries,
    hasAnyData,
    getLeavesCount,
    getBirthdaysCount,
    getAnniversariesCount,
    getTotalCount,
  }
}

export const useHrDataStore = defineStore('hrData', hrDataStoreSetup)

export type HrDataStore = ReturnType<typeof hrDataStoreSetup>

// Export types for use in components
export type { MockEmployee, Leave, Birthday, Anniversary }
