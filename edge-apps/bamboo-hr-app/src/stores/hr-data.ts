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
  name: string
  start: string
  end: string
  type: string
}

interface EmployeeOnLeave {
  employeeId: number
  name: string
  start: string
  end: string
  type: string
  avatar?: string | null
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
  hireDate: string
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
  const employeesOnLeave: Ref<EmployeeOnLeave[]> = ref([])

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

  const setAnniversaryData = async () => {
    try {
      const settingsStore = useSettingsStore()
      const userTimezone = settingsStore.getTimezone() || 'UTC'

      // Get current date in user's timezone for compariso            'Content-Type': 'application/json',n
      const today = dayjs().tz(userTimezone)
      const nextWeek = dayjs().tz(userTimezone).add(7, 'day')

      // Filter employees whose work anniversaries are within the next 7 days
      const upcomingAnniversaries = employees.value.filter(
        (employee: Employee) => {
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
        },
      )

      const anniversaryData: Anniversary[] = upcomingAnniversaries.map(
        (employee: Employee) => ({
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          hireDate: employee.hireDate,
          avatar: null,
        }),
      )

      anniversaries.value = anniversaryData
    } catch {
      setError('Failed to load anniversary data')
    }
  }

  const fetchLeaveData = async () => {
    try {
      const settingsStore = useSettingsStore()
      const bambooHrApiBaseUrl = `https://${settingsStore.subdomain}.bamboohr.com/api/v1`

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

      const employeesOnLeaveData: EmployeeOnLeave[] = data.map(
        (item: EmployeeOnLeave) => ({
          employeeId: item.employeeId,
          name: item.name,
          start: item.start,
          end: item.end,
          type: item.type,
        }),
      )

      employeesOnLeave.value = employeesOnLeaveData
    } catch {
      setError('Failed to load leave data')
    }
  }

  const init = async () => {
    setLoading(true)
    setError(null)

    try {
      await fetchEmployeeData()
      await fetchLeaveData()
      await setBirthdayData()
      await setAnniversaryData()
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

  // Getters
  const hasLeaves = () => {
    return employeesOnLeave.value.length > 0
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
    employeesOnLeave,

    // Actions
    init,
    setLoading,
    setError,
    setLeaves,

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
export type { MockEmployee, Leave, Birthday, Anniversary, EmployeeOnLeave }
