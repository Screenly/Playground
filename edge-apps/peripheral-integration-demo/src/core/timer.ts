import { subscribe, getState, setScreen } from './state'

const AUTO_LOGOUT_MS = 60 * 1000

let logoutTimeout: ReturnType<typeof setTimeout> | null = null
let countdownInterval: ReturnType<typeof setInterval> | null = null
let remainingSeconds = AUTO_LOGOUT_MS / 1000

function getLogoutBar() {
  return document.getElementById('logout-bar')!
}

function getLogoutTimerEl() {
  return document.getElementById('logout-timer')!
}

function clearTimer() {
  if (logoutTimeout) clearTimeout(logoutTimeout)
  if (countdownInterval) clearInterval(countdownInterval)
  logoutTimeout = null
  countdownInterval = null
  getLogoutBar().classList.add('hidden')
}

function startLogoutTimer() {
  clearTimer()
  getLogoutBar().classList.remove('hidden')
  remainingSeconds = AUTO_LOGOUT_MS / 1000
  getLogoutTimerEl().textContent = String(remainingSeconds)

  logoutTimeout = setTimeout(() => {
    setScreen('public')
  }, AUTO_LOGOUT_MS)

  countdownInterval = setInterval(() => {
    remainingSeconds--
    getLogoutTimerEl().textContent = String(remainingSeconds)
    if (remainingSeconds <= 0 && countdownInterval) {
      clearInterval(countdownInterval)
    }
  }, 1000)
}

function onStateChange(state: ReturnType<typeof getState>) {
  clearTimer()
  if (state.currentScreen !== 'public') {
    startLogoutTimer()
  }
}

export function initTimers() {
  subscribe(onStateChange)
  onStateChange(getState())
}
