import type { PeripheralStateMessage } from '@screenly/edge-apps'

import { getState, setTemperature } from '../core/state'
import { showWelcomeThenSwitch } from '../core/screen'
import { authenticate } from './authenticate'

export function initPeripherals() {
  screenly.peripherals?.watchState((msg: PeripheralStateMessage) => {
    console.log('Peripheral readings:', JSON.stringify(msg, null, 2))
    const readings = msg.request.edge_app_source_state.states

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
