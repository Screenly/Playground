import './css/style.css'
import '@screenly/edge-apps/components'
import {
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'
import type { PeripheralReading, PeripheralSnapshot } from '@screenly/edge-apps'

const SENSOR_CARDS: Record<string, string> = {
  temperature_1: 'temperature',
  humidity_1: 'humidity',
  air_pressure_1: 'air_pressure',
}

function updateSensorCard(cardKey: string, reading: PeripheralReading): void {
  const sensor = SENSOR_CARDS[cardKey]
  if (!sensor) return

  const valueEl = document.querySelector<HTMLSpanElement>(`#val-${sensor}`)
  const unitEl = document.querySelector<HTMLSpanElement>(`#unit-${sensor}`)
  const tsEl = document.querySelector<HTMLSpanElement>(`#ts-${sensor}`)
  const cardEl = document.querySelector<HTMLDivElement>(`#card-${sensor}`)

  if (valueEl) {
    valueEl.textContent =
      typeof reading.value === 'number'
        ? reading.value.toFixed(2)
        : String(reading.value)
  }
  if (unitEl && reading.unit) {
    unitEl.textContent = reading.unit
  }
  if (tsEl) {
    tsEl.textContent = new Date(reading.retrieved_at).toLocaleTimeString()
  }
  if (cardEl) {
    cardEl.classList.add('active')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupErrorHandling()
  setupTheme()

  screenly.peripherals?.subscribe((snapshot: PeripheralSnapshot) => {
    for (const key of Object.keys(SENSOR_CARDS)) {
      const reading = snapshot[key] as PeripheralReading | undefined
      if (reading) {
        updateSensorCard(key, reading)
      }
    }
  })

  signalReady()
})
