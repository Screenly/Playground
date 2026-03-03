import type { PeripheralReading } from '@screenly/edge-apps'

import { setTemperature } from '../core/state'

export function initPeripherals() {
  screenly.peripherals?.watchState((readings: PeripheralReading[]) => {
    const tempReading = readings.find((r) => 'ambient_temperature' in r)
    if (tempReading) {
      setTemperature(tempReading.ambient_temperature as number)
    }
  })
}
