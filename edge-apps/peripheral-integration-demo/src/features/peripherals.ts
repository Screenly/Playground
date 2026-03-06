import { createPeripheralClient } from '@screenly/edge-apps'
import type { PeripheralStateMessage } from '@screenly/edge-apps'

import { getState, setTemperature } from '../core/state'
import { showWelcomeThenSwitch } from '../core/screen'
import { restartLogoutTimer } from '../core/timer'
import { authenticate } from './authenticate'

export function initPeripherals() {
  const client = createPeripheralClient()

  // TODO: Replace with the actual Edge App ID once the app is published.
  const edgeAppId = '01JZQK8VW3MXNP4RSDTHF6CY2B'
  client.register(edgeAppId)

  client.watchState((msg: PeripheralStateMessage) => {
    const readings = msg.request.edge_app_source_state.states

    const tempReading = readings.find((r) => 'ambient_temperature' in r)
    if (tempReading) {
      setTemperature(tempReading.ambient_temperature as number)
    }

    const cardReading = readings.find((r) => 'secure_card' in r)
    if (cardReading) {
      const MAX_CARD_AGE_MS = 60_000
      const ageMs = Date.now() - (cardReading.timestamp as number)
      if (ageMs > MAX_CARD_AGE_MS) {
        if (getState().currentScreen !== 'public') {
          showWelcomeThenSwitch('public')
        }
      } else {
        const uid = (cardReading.secure_card as { uid: string }).uid
        const role = authenticate(uid)
        if (role) {
          if (role !== getState().currentScreen) {
            showWelcomeThenSwitch(role)
          } else {
            restartLogoutTimer()
          }
        }
      }
    }
  })
}
