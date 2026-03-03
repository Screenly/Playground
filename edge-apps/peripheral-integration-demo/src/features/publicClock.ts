import { getTimeZone, getLocale } from '@screenly/edge-apps'

import { getState, setTimezone, setLocale } from '../core/state'
import { formatDisplayTime } from '../utils/time'

function getEl(id: string): HTMLElement {
  return document.getElementById(id)!
}

function tick() {
  const state = getState()
  const now = new Date()
  const { timeStr, dateStr, dateStrShort } = formatDisplayTime(
    now,
    state.locale,
    state.timezone,
  )

  getEl('public-time').textContent = timeStr
  getEl('public-date').textContent = dateStr

  if (
    state.currentScreen === 'operator' ||
    state.currentScreen === 'maintenance'
  ) {
    getEl('role-header-time').textContent = timeStr
    getEl('role-header-date').textContent = dateStrShort
  }
}

export async function initPublicClock() {
  try {
    setTimezone(await getTimeZone())
    setLocale(await getLocale())
  } catch (error) {
    console.warn('Failed to get timezone/locale:', error)
  }

  tick()
  setInterval(tick, 1000)
}
