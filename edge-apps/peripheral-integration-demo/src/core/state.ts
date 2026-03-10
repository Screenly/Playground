export type ScreenType = 'public' | 'operator' | 'maintenance'

export interface AppState {
  currentScreen: ScreenType
  timezone: string
  locale: string
  temperature: number | null
  humidity: number | null
  airPressure: number | null
}

const state: AppState = {
  currentScreen: 'public',
  timezone: 'UTC',
  locale: 'en',
  temperature: null,
  humidity: null,
  airPressure: null,
}

type Listener = (state: AppState) => void

const listeners: Listener[] = []

export function subscribe(listener: Listener) {
  listeners.push(listener)
}

function notify() {
  listeners.forEach((fn) => fn({ ...state }))
}

/* ===================== */
/* Mutations             */
/* ===================== */

export function setScreen(screen: ScreenType) {
  state.currentScreen = screen
  notify()
}

export function setTimezone(tz: string) {
  state.timezone = tz
  notify()
}

export function setLocale(locale: string) {
  state.locale = locale
  notify()
}

export function setSensorReadings(readings: {
  temperature?: number | null
  humidity?: number | null
  airPressure?: number | null
}) {
  if (readings.temperature !== undefined)
    state.temperature = readings.temperature
  if (readings.humidity !== undefined) state.humidity = readings.humidity
  if (readings.airPressure !== undefined)
    state.airPressure = readings.airPressure
  notify()
}

export function getState(): Readonly<AppState> {
  return { ...state }
}

let lastPeripheralState: unknown = null

export function setLastPeripheralState(raw: unknown) {
  lastPeripheralState = raw
}

export function getLastPeripheralState(): unknown {
  return lastPeripheralState
}
