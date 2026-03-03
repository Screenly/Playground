import './css/style.css'
import '@screenly/edge-apps/components'
import {
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import type { PeripheralReading } from '@screenly/edge-apps'

const WIRE_KEYS = ['ambient_temperature', 'secure_card_id'] as const
type WireKey = (typeof WIRE_KEYS)[number]

function updateSensorCard(reading: PeripheralReading): void {
  const wireKey = WIRE_KEYS.find((k) => k in reading)
  if (!wireKey) return

  const valueEl = document.querySelector<HTMLSpanElement>(`#val-${wireKey}`)
  const unitEl = document.querySelector<HTMLSpanElement>(`#unit-${wireKey}`)
  const tsEl = document.querySelector<HTMLSpanElement>(`#ts-${wireKey}`)
  const cardEl = document.querySelector<HTMLDivElement>(`#card-${wireKey}`)

  if (valueEl) {
    const raw = reading[wireKey as WireKey]
    valueEl.textContent =
      typeof raw === 'number' ? (raw as number).toFixed(2) : String(raw)
  }
  if (unitEl && reading.unit) {
    unitEl.textContent = reading.unit
  }
  if (tsEl) {
    tsEl.textContent = new Date(reading.timestamp).toLocaleTimeString()
  }
  if (cardEl) {
    cardEl.classList.add('active')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()
  setupTheme()

  screenly.peripherals?.watchState((readings: PeripheralReading[]) => {
    readings.forEach(updateSensorCard)
  })

  signalReady()
})
