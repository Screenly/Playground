import {
  getScreenlyVersion,
  getHardware,
  getScreenName,
  getHostname,
  getTimeZone,
} from '@screenly/edge-apps'
import { Hardware } from '@screenly/edge-apps'

import { subscribe, getState, setScreen, type ScreenType } from './state'
import {
  waitForScreenDataPrepared,
  dispatchScreenDataPrepared,
} from './screen-events'
import { getNetworkStatus } from '../utils/network'
import { updateOperatorDashboard } from '../features/operator-dashboard'

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const WELCOME_DURATION_MS = 800
const FADE_OUT_MS = 250

const userMap: Record<ScreenType, { name: string; role: string }> = {
  public: { name: 'Guest', role: 'Public' },
  operator: { name: 'Jack', role: 'Operator' },
  maintenance: { name: 'Anna', role: 'Maintenance' },
}

function getEl(id: string): HTMLElement {
  return document.getElementById(id)!
}

let isTransitioning = false

function syncScreensToState(state: ReturnType<typeof getState>) {
  const screens: Record<ScreenType, HTMLElement> = {
    public: getEl('screen-public'),
    operator: getEl('screen-operator'),
    maintenance: getEl('screen-maintenance'),
  }

  if (isTransitioning) {
    ;(Object.keys(screens) as ScreenType[]).forEach((key) => {
      screens[key].classList.add('hidden')
    })
  } else {
    ;(Object.keys(screens) as ScreenType[]).forEach((key) => {
      screens[key].classList.toggle('hidden', key !== state.currentScreen)
    })
  }

  const publicTemp = getEl('public-temperature')
  publicTemp.textContent =
    state.temperature !== null ? `${Math.round(state.temperature)}°C` : '--'

  if (state.currentScreen === 'maintenance') {
    getEl('maintenance-network').textContent = getNetworkStatus()
  }
}

const HARDWARE_DISPLAY: Record<Hardware, string> = {
  [Hardware.RaspberryPi]: 'Raspberry Pi',
  [Hardware.ScreenlyPlayerMax]: 'Screenly Player Max',
  [Hardware.Anywhere]: 'Anywhere',
  [Hardware.Unknown]: 'Anywhere',
}

async function loadMaintenanceInfo() {
  getEl('maintenance-screenly-version').textContent = getScreenlyVersion()
  getEl('maintenance-hardware').textContent =
    HARDWARE_DISPLAY[getHardware()] ?? getHardware()
  getEl('maintenance-screen-name').textContent = getScreenName()
  getEl('maintenance-hostname').textContent = getHostname()
  try {
    const tz = await getTimeZone()
    getEl('maintenance-timezone').textContent = tz
  } catch {
    getEl('maintenance-timezone').textContent = '—'
  }
}

async function preloadScreenData(role: ScreenType): Promise<void> {
  try {
    if (role === 'maintenance') {
      await loadMaintenanceInfo()
      getEl('maintenance-network').textContent = getNetworkStatus()
    } else if (role === 'operator') {
      updateOperatorDashboard()
    }
  } finally {
    dispatchScreenDataPrepared(role)
  }
}

export async function showWelcomeThenSwitch(role: ScreenType) {
  isTransitioning = true
  try {
    const { name, role: roleLabel } = userMap[role]
    const welcomeOverlay = getEl('welcome-overlay')
    const welcomeName = getEl('welcome-name')
    const welcomeRole = getEl('welcome-role')

    welcomeName.textContent = `Welcome, ${name}`
    welcomeRole.textContent = `Role: ${roleLabel}`
    welcomeOverlay.classList.remove('hidden')
    requestAnimationFrame(() => welcomeOverlay.classList.remove('opacity-0'))
    ;(
      Object.keys({ public: 1, operator: 1, maintenance: 1 }) as ScreenType[]
    ).forEach((key) => {
      getEl(`screen-${key}`).classList.add('hidden')
    })

    const overlayShownAt = Date.now()
    const dataReadyPromise = waitForScreenDataPrepared(role)
    preloadScreenData(role)

    await dataReadyPromise
    const elapsed = Date.now() - overlayShownAt
    if (elapsed < WELCOME_DURATION_MS) {
      await delay(WELCOME_DURATION_MS - elapsed)
    }

    welcomeOverlay.classList.add('opacity-0')
    await delay(FADE_OUT_MS)
    welcomeOverlay.classList.add('hidden')
    isTransitioning = false
    setScreen(role)
  } finally {
    isTransitioning = false
  }
}

function setupNetworkListeners() {
  const updateNetworkIfMaintenance = () => {
    if (getState().currentScreen === 'maintenance') {
      getEl('maintenance-network').textContent = getNetworkStatus()
    }
  }
  window.addEventListener('online', updateNetworkIfMaintenance)
  window.addEventListener('offline', updateNetworkIfMaintenance)
}

export function initScreens() {
  subscribe(syncScreensToState)
  syncScreensToState(getState())

  setupNetworkListeners()
}
