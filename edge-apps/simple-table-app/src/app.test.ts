import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

import init, { parseCSV, renderTable } from './app'

const DOM = `
  <h2 id="table-title" hidden></h2>
  <table id="data-table">
    <thead id="table-head"></thead>
    <tbody id="table-body"></tbody>
  </table>
`

const TEAM_DIRECTORY_CSV = [
  'Name,Department,Location,Years,Role',
  'Alice Johnson,Engineering,New York,5,Senior Engineer',
  'Bob Smith,Marketing,Los Angeles,3,Marketing Manager',
  'Carol White,Design,Chicago,7,Lead Designer',
  'David Lee,Engineering,San Francisco,2,Software Engineer',
  'Eva Brown,Product,Seattle,4,Product Manager',
  'Frank Kim,Engineering,Austin,6,Staff Engineer',
  'Grace Patel,Sales,Boston,1,Account Executive',
  'Henry Nguyen,Design,New York,3,UX Designer',
].join('\n')

const TEAM_DIRECTORY_ROWS = [
  ['Name', 'Department', 'Location', 'Years', 'Role'],
  ['Alice Johnson', 'Engineering', 'New York', '5', 'Senior Engineer'],
  ['Bob Smith', 'Marketing', 'Los Angeles', '3', 'Marketing Manager'],
  ['Carol White', 'Design', 'Chicago', '7', 'Lead Designer'],
  ['David Lee', 'Engineering', 'San Francisco', '2', 'Software Engineer'],
  ['Eva Brown', 'Product', 'Seattle', '4', 'Product Manager'],
  ['Frank Kim', 'Engineering', 'Austin', '6', 'Staff Engineer'],
  ['Grace Patel', 'Sales', 'Boston', '1', 'Account Executive'],
  ['Henry Nguyen', 'Design', 'New York', '3', 'UX Designer'],
]

describe('Simple Table App', () => {
  beforeEach(() => {
    document.body.innerHTML = DOM
    setupScreenlyMock(
      {},
      { content: 'Name,Age\nAlice,30\nBob,25', title: 'Team Directory' },
    )
  })

  afterEach(() => {
    resetScreenlyMock()
    document.body.innerHTML = ''
  })

  test('parses larger table into a 2D array', () => {
    expect(parseCSV(TEAM_DIRECTORY_CSV)).toEqual(TEAM_DIRECTORY_ROWS)
  })

  test('handles quoted fields with commas', () => {
    expect(parseCSV('"Last, First",Age\n"Smith, John",40')).toEqual([
      ['Last, First', 'Age'],
      ['Smith, John', '40'],
    ])
  })

  test('renders special characters safely via textContent', () => {
    renderTable('Name,Value\n<script>alert(1)</script>,test')

    const cell = document.querySelector('#table-body td')
    expect(cell?.textContent).toBe('<script>alert(1)</script>')
    expect(document.body.innerHTML).not.toContain('<script>alert(1)</script>')
  })

  test('renders table from content setting', () => {
    init()

    expect(document.querySelectorAll('#table-head th')).toHaveLength(2)
    expect(document.querySelectorAll('#table-body tr')).toHaveLength(2)
  })

  test('renders title from setting', () => {
    init()

    const titleEl = document.getElementById('table-title')
    expect(titleEl?.textContent).toBe('Team Directory')
    expect(titleEl?.hidden).toBe(false)
  })

  test('hides title when setting is empty', () => {
    setupScreenlyMock({}, { content: 'Name,Age\nAlice,30', title: '' })
    init()

    expect(document.getElementById('table-title')?.hidden).toBe(true)
  })

  test('falls back to default content when setting is missing', () => {
    setupScreenlyMock({}, {})
    init()

    const headers = document.querySelectorAll('#table-head th')
    expect(headers).toHaveLength(2)
    expect(headers[0].textContent).toBe('Name')
    expect(headers[1].textContent).toBe('Age')
  })
})
