import type { PeripheralStateMessage } from '@screenly/edge-apps'

import { getState, setTemperature } from '../core/state'
import { showWelcomeThenSwitch } from '../core/screen'
import { authenticate } from './authenticate'

// TODO: Replace with a shared ULID utility from edge-apps-library
// Generates a 26-character ULID using Crockford's Base32 alphabet
// (0-9, A-Z excluding I, L, O, U): 10 timestamp chars + 16 random chars
function generateUlid(): string {
  const chars = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
  let t = Date.now()
  let time = ''
  for (let i = 9; i >= 0; i--) {
    time = chars[t % 32] + time
    t = Math.floor(t / 32)
  }
  let rand = ''
  for (let i = 0; i < 16; i++) {
    rand += chars[Math.floor(Math.random() * 32)]
  }
  return time + rand
}

export function initPeripherals() {
  const edgeAppId = screenly.screenly_edge_app_id ?? generateUlid()
  screenly.peripherals?.register(edgeAppId)

  screenly.peripherals?.watchState((msg: PeripheralStateMessage) => {
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
