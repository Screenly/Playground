import { describe, it, expect, beforeEach } from 'bun:test'
import { JSDOM } from 'jsdom'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)
import {
  renderEmployeeDateList,
  renderOnLeave,
  setTimezone,
  MAX_ITEMS,
} from './render'
import type { Employee, Leave } from './types'

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    eeid: 1,
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '',
    hireDate: '',
    employeePhoto: '',
    ...overrides,
  }
}

function makeLeave(overrides: Partial<Leave> = {}): Leave {
  return {
    id: 1,
    employeeId: 1,
    name: 'Jane Smith',
    start: '2025-06-15',
    end: '2025-06-15',
    type: 'vacation',
    ...overrides,
  }
}

function setupDom(): void {
  const dom = new JSDOM(`<!DOCTYPE html><body>
    <div id="birthdays-list"></div>
    <div id="birthdays-summary"></div>
    <div id="anniversaries-list"></div>
    <div id="anniversaries-summary"></div>
    <div id="on-leave-list"></div>
    <div id="on-leave-summary"></div>
  </body>`)
  global.document = dom.window.document
}

beforeEach(() => {
  setupDom()
  setTimezone('UTC')
})

// eslint-disable-next-line max-lines-per-function
describe('renderEmployeeDateList', () => {
  const listId = 'birthdays-list'
  const summaryId = 'birthdays-summary'
  const countLabel = (n: number) =>
    n === 1 ? 'employee has a birthday' : 'employees have birthdays'
  const emptyMsg = 'No upcoming birthdays.'

  it('renders empty state when no employees match', () => {
    renderEmployeeDateList(
      listId,
      summaryId,
      [],
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const list = document.getElementById(listId)!
    expect(list.querySelector('.empty-state')?.textContent).toBe(emptyMsg)
  })

  it('renders employee rows for matching dates', () => {
    const today = dayjs().startOf('day')
    const employees = [
      makeEmployee({
        eeid: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: `1990-${today.format('MM-DD')}`,
      }),
    ]
    renderEmployeeDateList(
      listId,
      summaryId,
      employees,
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const list = document.getElementById(listId)!
    expect(list.querySelectorAll('.employee-row').length).toBe(1)
    expect(list.querySelector('.employee-name')?.textContent).toBe('Jane Smith')
  })

  it('caps rendered rows at MAX_ITEMS', () => {
    const today = dayjs().startOf('day')
    const date = `1990-${today.format('MM-DD')}`
    const employees = Array.from({ length: MAX_ITEMS + 2 }, (_, i) =>
      makeEmployee({
        eeid: i,
        firstName: `A${i}`,
        lastName: 'B',
        dateOfBirth: date,
      }),
    )
    renderEmployeeDateList(
      listId,
      summaryId,
      employees,
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const list = document.getElementById(listId)!
    expect(list.querySelectorAll('.employee-row').length).toBe(MAX_ITEMS)
  })

  it('sorts today before tomorrow, then alphabetically', () => {
    const today = dayjs().startOf('day')
    const tomorrow = today.add(1, 'day')
    const employees = [
      makeEmployee({
        eeid: 1,
        firstName: 'Zara',
        lastName: 'Adams',
        dateOfBirth: `1990-${today.format('MM-DD')}`,
      }),
      makeEmployee({
        eeid: 2,
        firstName: 'Anna',
        lastName: 'Zeno',
        dateOfBirth: `1990-${tomorrow.format('MM-DD')}`,
      }),
      makeEmployee({
        eeid: 3,
        firstName: 'Anna',
        lastName: 'Adams',
        dateOfBirth: `1990-${today.format('MM-DD')}`,
      }),
    ]
    renderEmployeeDateList(
      listId,
      summaryId,
      employees,
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const names = [
      ...document.getElementById(listId)!.querySelectorAll('.employee-name'),
    ].map((el) => el.textContent)
    expect(names).toEqual(['Anna Adams', 'Zara Adams', 'Anna Zeno'])
  })

  it('renders summary count when employees match', () => {
    const today = dayjs().startOf('day')
    const employees = [
      makeEmployee({
        eeid: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: `1990-${today.format('MM-DD')}`,
      }),
    ]
    renderEmployeeDateList(
      listId,
      summaryId,
      employees,
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const summary = document.getElementById(summaryId)!
    expect(summary.querySelector('.summary-count')?.textContent).toBe(
      '1 employee has a birthday',
    )
  })

  it('renders empty state in summary when no matches', () => {
    renderEmployeeDateList(
      listId,
      summaryId,
      [],
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const summary = document.getElementById(summaryId)!
    expect(summary.querySelector('.empty-state')?.textContent).toBe(emptyMsg)
  })

  it('renders avatar img when photo URL is provided', () => {
    const today = dayjs().startOf('day')
    const employees = [
      makeEmployee({
        eeid: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: `1990-${today.format('MM-DD')}`,
        employeePhoto: 'https://example.com/photo.jpg',
      }),
    ]
    renderEmployeeDateList(
      listId,
      summaryId,
      employees,
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const list = document.getElementById(listId)!
    expect(list.querySelector('img.avatar')).not.toBeNull()
  })

  it('renders initials when photo URL is empty', () => {
    const today = dayjs().startOf('day')
    const employees = [
      makeEmployee({
        eeid: 1,
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: `1990-${today.format('MM-DD')}`,
        employeePhoto: '',
      }),
    ]
    renderEmployeeDateList(
      listId,
      summaryId,
      employees,
      'dateOfBirth',
      countLabel,
      emptyMsg,
    )
    const list = document.getElementById(listId)!
    const initials = list.querySelector('.avatar-initials')
    expect(initials?.textContent).toBe('JS')
  })
})

describe('renderOnLeave', () => {
  it('renders empty state when no leaves', () => {
    renderOnLeave([])
    const list = document.getElementById('on-leave-list')!
    expect(list.querySelector('.empty-state')?.textContent).toBe(
      'No one on leave today.',
    )
  })

  it('renders employee rows for each leave', () => {
    const leaves = [
      makeLeave({ name: 'Jane Smith' }),
      makeLeave({ id: 2, name: 'Bob Jones' }),
    ]
    renderOnLeave(leaves)
    const list = document.getElementById('on-leave-list')!
    expect(list.querySelectorAll('.employee-row').length).toBe(2)
  })

  it('caps rendered rows at MAX_ITEMS', () => {
    const leaves = Array.from({ length: MAX_ITEMS + 2 }, (_, i) =>
      makeLeave({ id: i, name: `Person ${i}` }),
    )
    renderOnLeave(leaves)
    const list = document.getElementById('on-leave-list')!
    expect(list.querySelectorAll('.employee-row').length).toBe(MAX_ITEMS)
  })

  it('parses initials from full name', () => {
    renderOnLeave([makeLeave({ name: 'Jane Smith' })])
    const list = document.getElementById('on-leave-list')!
    expect(list.querySelector('.avatar-initials')?.textContent).toBe('JS')
  })

  it('renders singular summary label for one employee', () => {
    renderOnLeave([makeLeave({ name: 'Jane Smith' })])
    const summary = document.getElementById('on-leave-summary')!
    expect(summary.querySelector('.summary-count')?.textContent).toBe(
      '1 employee is away today',
    )
  })

  it('renders plural summary label for multiple employees', () => {
    renderOnLeave([
      makeLeave({ name: 'Jane Smith' }),
      makeLeave({ id: 2, name: 'Bob Jones' }),
    ])
    const summary = document.getElementById('on-leave-summary')!
    expect(summary.querySelector('.summary-count')?.textContent).toBe(
      '2 employees are away today',
    )
  })
})
