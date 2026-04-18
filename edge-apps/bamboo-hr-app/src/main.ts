import './css/style.css'
import '@screenly/edge-apps/components'
import {
  getCorsProxyUrl,
  getLocale,
  getSettingWithDefault,
  getTimeZone,
  setupErrorHandling,
  setupTheme,
  signalReady,
  formatTime,
  formatLocalizedDate,
} from '@screenly/edge-apps'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const MAX_ITEMS = 5
const DEFAULT_EMPLOYEE_PHOTO_URL =
  'https://resources.bamboohr.com/images/photo_person_160x160.png'
const REFRESH_INTERVAL = 30_000

interface Employee {
  eeid: number
  firstName: string
  lastName: string
  dateOfBirth: string
  hireDate: string
  employeePhoto: string
}

interface Leave {
  id: number
  employeeId: number
  name: string
  start: string
  end: string
  type: string
}

let currentLocale = 'en'
let currentTimezone = 'UTC'

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function buildAvatarEl(
  photoUrl: string | null,
  firstName: string,
  lastName: string,
): HTMLElement {
  if (photoUrl && photoUrl !== DEFAULT_EMPLOYEE_PHOTO_URL) {
    const img = document.createElement('img')
    img.src = photoUrl
    img.alt = `${firstName} ${lastName}`
    img.className = 'avatar'
    img.onerror = () => {
      const fallback = buildInitialsEl(firstName, lastName)
      img.replaceWith(fallback)
    }
    return img
  }
  return buildInitialsEl(firstName, lastName)
}

function buildInitialsEl(firstName: string, lastName: string): HTMLElement {
  const div = document.createElement('div')
  div.className = 'avatar-initials'
  div.textContent = getInitials(firstName, lastName)
  return div
}

function buildEmployeeRow(avatar: HTMLElement, name: string): HTMLElement {
  const row = document.createElement('div')
  row.className = 'employee-row'

  const nameEl = document.createElement('span')
  nameEl.className = 'employee-name'
  nameEl.textContent = name

  row.appendChild(avatar)
  row.appendChild(nameEl)
  return row
}

function renderEmployeeDateList(
  listId: string,
  employees: Employee[],
  dateField: 'dateOfBirth' | 'hireDate',
  emptyMessage: string,
): void {
  const today = dayjs().tz(currentTimezone).startOf('day')
  const tomorrow = today.add(1, 'day')

  const upcoming = employees
    .filter((e) => {
      if (!e[dateField]) return false
      const d = dayjs(e[dateField]).year(today.year())
      return d.isSame(today, 'day') || d.isSame(tomorrow, 'day')
    })
    .sort((a, b) => {
      const aD = dayjs(a[dateField]).year(today.year())
      const bD = dayjs(b[dateField]).year(today.year())
      const rank = (d: dayjs.Dayjs) => (d.isSame(today, 'day') ? 0 : 1)
      const diff = rank(aD) - rank(bD)
      if (diff !== 0) return diff
      const ln = a.lastName.localeCompare(b.lastName)
      return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName)
    })
    .slice(0, MAX_ITEMS)

  const list = document.getElementById(listId)!
  list.innerHTML = ''

  if (upcoming.length === 0) {
    const p = document.createElement('p')
    p.className = 'empty-state'
    p.textContent = emptyMessage
    list.appendChild(p)
    return
  }

  for (const emp of upcoming) {
    const avatar = buildAvatarEl(emp.employeePhoto, emp.firstName, emp.lastName)
    const row = buildEmployeeRow(avatar, `${emp.firstName} ${emp.lastName}`)
    list.appendChild(row)
  }
}

function renderBirthdays(employees: Employee[]): void {
  renderEmployeeDateList(
    'birthdays-list',
    employees,
    'dateOfBirth',
    'No upcoming birthdays.',
  )
}

function renderAnniversaries(employees: Employee[]): void {
  renderEmployeeDateList(
    'anniversaries-list',
    employees,
    'hireDate',
    'No upcoming anniversaries.',
  )
}

function renderOnLeave(leaves: Leave[]): void {
  const list = document.getElementById('on-leave-list')!
  list.innerHTML = ''

  if (leaves.length === 0) {
    const p = document.createElement('p')
    p.className = 'empty-state'
    p.textContent = 'No one on leave today.'
    list.appendChild(p)
    return
  }

  for (const leave of leaves.slice(0, MAX_ITEMS)) {
    const nameParts = leave.name.trim().split(/\s+/)
    const firstName = nameParts[0] ?? ''
    const lastName = nameParts[nameParts.length - 1] ?? ''

    const avatar = buildInitialsEl(firstName, lastName)
    const row = buildEmployeeRow(avatar, leave.name)
    list.appendChild(row)
  }
}

async function fetchEmployees(
  apiKey: string,
  subdomain: string,
): Promise<Employee[]> {
  const corsProxy = getCorsProxyUrl()
  const apiBase = `https://${subdomain}.bamboohr.com/api/v1`

  const response = await fetch(`${corsProxy}/${apiBase}/datasets/employee`, {
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
  })

  if (!response.ok) throw new Error(`Employee fetch failed: ${response.status}`)

  const data = await response.json()
  return (data.data ?? []) as Employee[]
}

async function fetchLeaves(
  apiKey: string,
  subdomain: string,
): Promise<Leave[]> {
  const corsProxy = getCorsProxyUrl()
  const apiBase = `https://${subdomain}.bamboohr.com/api/v1`

  const response = await fetch(`${corsProxy}/${apiBase}/time_off/whos_out`, {
    headers: {
      Authorization: `Basic ${btoa(apiKey + ':')}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) throw new Error(`Leave fetch failed: ${response.status}`)

  const data: Leave[] = await response.json()
  const today = dayjs().tz(currentTimezone).startOf('day')

  return data.filter((item) => {
    const start = dayjs(item.start).tz(currentTimezone).startOf('day')
    const end = dayjs(item.end).tz(currentTimezone).startOf('day')
    return today.isSameOrAfter(start) && today.isSameOrBefore(end)
  })
}

function updateClock(): void {
  const now = new Date()
  const timeEl = document.getElementById('clock-time')
  const dateEl = document.getElementById('clock-date')

  if (!timeEl || !dateEl) return

  const { formatted } = formatTime(now, currentLocale, currentTimezone)
  timeEl.textContent = formatted
  dateEl.textContent = formatLocalizedDate(now, currentLocale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
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
  renderOnLeave(leaves)
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

  updateDateHeading()
  updateClock()
  setInterval(updateClock, 1_000)

  signalReady()

  if (!apiKey || !subdomain) return

  await refreshData(apiKey, subdomain)
  setInterval(() => refreshData(apiKey, subdomain), REFRESH_INTERVAL)
})
