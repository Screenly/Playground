import {
  getSettingWithDefault,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import Papa from 'papaparse'

export function parseCSV(csv: string): string[][] {
  const result = Papa.parse<string[]>(csv.trim(), {
    skipEmptyLines: true,
  })

  if (result.errors && result.errors.length > 0) {
    const firstError = result.errors[0]
    const location =
      typeof firstError.row === 'number' ? ` on row ${firstError.row}` : ''
    throw new Error(`Failed to parse CSV${location}: ${firstError.message}`)
  }

  return result.data
}

export function renderTable(csv: string): void {
  const thead = document.getElementById('table-head')
  const tbody = document.getElementById('table-body')
  if (!thead || !tbody) return

  thead.innerHTML = ''
  tbody.innerHTML = ''

  const rows = parseCSV(csv)
  if (rows.length === 0) return

  const [headers, ...dataRows] = rows

  const headerRow = document.createElement('tr')
  headers.forEach((header) => {
    const th = document.createElement('th')
    th.textContent = header
    headerRow.appendChild(th)
  })
  thead.appendChild(headerRow)

  dataRows.forEach((row) => {
    const tr = document.createElement('tr')
    row.forEach((cell) => {
      const td = document.createElement('td')
      td.textContent = cell
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
}

export default function init(): void {
  setupTheme()

  const csvContent = getSettingWithDefault<string>(
    'content',
    'Name,Age\nJohn,25\nJane,30',
  )
  const title = getSettingWithDefault<string>('title', '')

  const titleEl = document.getElementById('table-title')
  if (titleEl && title) {
    titleEl.textContent = title
    titleEl.hidden = false
  }

  renderTable(csvContent)

  signalReady()
}
