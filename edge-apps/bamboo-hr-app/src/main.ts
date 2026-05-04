import './css/style.css'
import '@screenly/edge-apps/components'
import {
  getCorsProxyUrl,
  formatLocalizedDate,
  getLocale,
  getSettingWithDefault,
  getTimeZone,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { renderEmployeeDateList, renderOnLeave, setTimezone } from './render'
import type { Employee, Leave } from './types'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const REFRESH_INTERVAL = 30_000

let currentLocale = 'en'
let currentTimezone = 'UTC'

function getBambooApiBase(subdomain: string): string {
  return `${getCorsProxyUrl()}/https://${subdomain}.bamboohr.com/api/v1`
}

async function fetchEmployees(
  apiKey: string,
  subdomain: string,
): Promise<Employee[]> {
  const response = await fetch(
    `${getBambooApiBase(subdomain)}/datasets/employee`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(apiKey + ':')}`,
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

  if (!response.ok) throw new Error(`Employee fetch failed: ${response.status}`)
  const data = await response.json()
  return (data.data ?? []) as Employee[]
}

async function fetchLeaves(
  apiKey: string,
  subdomain: string,
): Promise<Leave[]> {
  const response = await fetch(
    `${getBambooApiBase(subdomain)}/time_off/whos_out`,
    {
      headers: {
        Authorization: `Basic ${btoa(apiKey + ':')}`,
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) throw new Error(`Leave fetch failed: ${response.status}`)

  const data: Leave[] = await response.json()
  const today = dayjs().tz(currentTimezone).startOf('day')
  return data.filter((item) => {
    const start = dayjs(item.start).tz(currentTimezone).startOf('day')
    const end = dayjs(item.end).tz(currentTimezone).startOf('day')
    return today.isSameOrAfter(start) && today.isSameOrBefore(end)
  })
}

function renderBirthdays(employees: Employee[]): void {
  renderEmployeeDateList(
    'birthdays-list',
    'birthdays-summary',
    employees,
    'dateOfBirth',
    (n) => (n === 1 ? 'employee has a birthday' : 'employees have birthdays'),
    'No upcoming birthdays.',
  )
}

function renderAnniversaries(employees: Employee[]): void {
  renderEmployeeDateList(
    'anniversaries-list',
    'anniversaries-summary',
    employees,
    'hireDate',
    (n) =>
      n === 1 ? 'employee has an anniversary' : 'employees have anniversaries',
    'No upcoming anniversaries.',
  )
}

function updateDateHeading(): void {
  const heading = document.getElementById('date-heading')
  if (!heading) return
  heading.textContent = formatLocalizedDate(new Date(), currentLocale, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

async function refreshData(apiKey: string, subdomain: string): Promise<void> {
  const [employees, leaves] = await Promise.all([
    fetchEmployees(apiKey, subdomain),
    fetchLeaves(apiKey, subdomain),
  ])
  renderBirthdays(employees)
  renderAnniversaries(employees)
  renderOnLeave(leaves, employees)
}

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const apiKey = getSettingWithDefault<string>('api_key', '')
  const subdomain = getSettingWithDefault<string>('subdomain', '')

  ;[currentLocale, currentTimezone] = await Promise.all([
    getLocale(),
    getTimeZone(),
  ])
  setTimezone(currentTimezone)

  updateDateHeading()
  signalReady()

  if (!apiKey || !subdomain) return

  await refreshData(apiKey, subdomain)
  setInterval(() => refreshData(apiKey, subdomain), REFRESH_INTERVAL)
})
