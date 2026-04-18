import dayjs from 'dayjs'
import type { Employee, Leave } from './types'

const DEFAULT_EMPLOYEE_PHOTO_URL =
  'https://resources.bamboohr.com/images/photo_person_160x160.png'

export const MAX_ITEMS = 5
export let currentTimezone = 'UTC'

export function setTimezone(tz: string): void {
  currentTimezone = tz
}

function buildInitialsEl(firstName: string, lastName: string): HTMLElement {
  const div = document.createElement('div')
  div.className = 'avatar-initials'
  div.textContent = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  return div
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
    img.onerror = () => img.replaceWith(buildInitialsEl(firstName, lastName))
    return img
  }
  return buildInitialsEl(firstName, lastName)
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

function renderEmptyState(container: HTMLElement, message: string): void {
  const p = document.createElement('p')
  p.className = 'empty-state'
  p.textContent = message
  container.appendChild(p)
}

function updateCardSummary(
  summaryId: string,
  count: number,
  countLabel: string,
  emptyMessage: string,
  items: { photoUrl: string | null; firstName: string; lastName: string }[],
): void {
  const summary = document.getElementById(summaryId)
  if (!summary) return
  summary.innerHTML = ''

  if (count === 0) {
    renderEmptyState(summary, emptyMessage)
    return
  }

  const countEl = document.createElement('p')
  countEl.className = 'summary-count'
  countEl.textContent = `${count} ${countLabel}`
  summary.appendChild(countEl)

  const group = document.createElement('div')
  group.className = 'avatar-group'
  for (const { photoUrl, firstName, lastName } of items) {
    group.appendChild(buildAvatarEl(photoUrl, firstName, lastName))
  }
  summary.appendChild(group)
}

export function renderEmployeeDateList(
  listId: string,
  summaryId: string,
  employees: Employee[],
  dateField: 'dateOfBirth' | 'hireDate',
  countLabel: (count: number) => string,
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
    renderEmptyState(list, emptyMessage)
  } else {
    for (const emp of upcoming) {
      const avatar = buildAvatarEl(
        emp.employeePhoto,
        emp.firstName,
        emp.lastName,
      )
      list.appendChild(
        buildEmployeeRow(avatar, `${emp.firstName} ${emp.lastName}`),
      )
    }
  }

  updateCardSummary(
    summaryId,
    upcoming.length,
    countLabel(upcoming.length),
    emptyMessage,
    upcoming.map((e) => ({
      photoUrl: e.employeePhoto,
      firstName: e.firstName,
      lastName: e.lastName,
    })),
  )
}

export function renderOnLeave(leaves: Leave[]): void {
  const items = leaves.slice(0, MAX_ITEMS).map((leave) => {
    const parts = leave.name.trim().split(/\s+/)
    return {
      name: leave.name,
      firstName: parts[0] ?? '',
      lastName: parts[parts.length - 1] ?? '',
    }
  })

  const list = document.getElementById('on-leave-list')!
  list.innerHTML = ''

  if (items.length === 0) {
    renderEmptyState(list, 'No one on leave today.')
  } else {
    for (const { name, firstName, lastName } of items) {
      list.appendChild(
        buildEmployeeRow(buildInitialsEl(firstName, lastName), name),
      )
    }
  }

  updateCardSummary(
    'on-leave-summary',
    items.length,
    items.length === 1 ? 'employee is away today' : 'employees are away today',
    'No one on leave today.',
    items.map(({ firstName, lastName }) => ({
      photoUrl: null,
      firstName,
      lastName,
    })),
  )
}
