import './css/style.css'
import '@screenly/edge-apps/components'
import {
  escapeHtml,
  getSettingWithDefault,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'

function parseCSV(csv: string): string[][] {
  return csv
    .trim()
    .split('\n')
    .map((row) => row.split(',').map((cell) => cell.trim()))
    .filter((row) => row.length > 0 && row.some((cell) => cell !== ''))
}

function renderTable(csv: string): void {
  const rows = parseCSV(csv)
  if (rows.length === 0) return

  const [headers, ...dataRows] = rows

  const thead = document.getElementById('table-head')
  const tbody = document.getElementById('table-body')
  if (!thead || !tbody) return

  const headerRow = document.createElement('tr')
  headers.forEach((header) => {
    const th = document.createElement('th')
    th.textContent = escapeHtml(header)
    headerRow.appendChild(th)
  })
  thead.appendChild(headerRow)

  dataRows.forEach((row) => {
    const tr = document.createElement('tr')
    row.forEach((cell) => {
      const td = document.createElement('td')
      td.textContent = escapeHtml(cell)
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()
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
})
