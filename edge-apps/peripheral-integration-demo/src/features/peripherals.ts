import type { PeripheralReading } from '@screenly/edge-apps'

import { getState, setTemperature } from '../core/state'
import { showWelcomeThenSwitch } from '../core/screen'
import { authenticate } from './authenticate'

export function initPeripherals() {
  screenly.peripherals?.watchState((readings: PeripheralReading[]) => {
    const tempReading = readings.find((r) => 'ambient_temperature' in r)
    if (tempReading) {
      setTemperature(tempReading.ambient_temperature as number)
    }

    const cardReading = readings.find((r) => 'secure_card_id' in r)
    if (cardReading) {
      const role = authenticate(cardReading.secure_card_id as string)
      if (role && role !== getState().currentScreen) {
        showWelcomeThenSwitch(role)
      }
    }
  })
}
