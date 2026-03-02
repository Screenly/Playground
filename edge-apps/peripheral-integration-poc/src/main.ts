import './css/style.css'
import '@screenly/edge-apps/components'
import {
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import type { PeripheralEvent } from '@screenly/edge-apps'

function updateSensorCard(event: PeripheralEvent): void {
  const valueEl = document.querySelector<HTMLSpanElement>(
    `#val-${event.sensor}`,
  )
  const unitEl = document.querySelector<HTMLSpanElement>(
    `#unit-${event.sensor}`,
  )
  const tsEl = document.querySelector<HTMLSpanElement>(`#ts-${event.sensor}`)
  const cardEl = document.querySelector<HTMLDivElement>(`#card-${event.sensor}`)

  if (valueEl) {
    valueEl.textContent =
      typeof event.value === 'number'
        ? event.value.toFixed(2)
        : String(event.value)
  }
  if (unitEl && event.unit) {
    unitEl.textContent = event.unit
  }
  if (tsEl) {
    tsEl.textContent = new Date(event.timestamp).toLocaleTimeString()
  }
  if (cardEl) {
    cardEl.classList.add('active')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()
  setupTheme()

  screenly.peripherals?.subscribe((event: PeripheralEvent) => {
    updateSensorCard(event)
  })

  signalReady()
})
