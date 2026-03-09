import { getState, subscribe } from '../core/state'

const TARGET = 1000
const UPDATE_INTERVAL_MS = 1200
const PRODUCTS = [
  'Industrial Widget A',
  'Industrial Widget B',
  'Precision Component C',
]

let intervalId: ReturnType<typeof setInterval> | null = null

let actual = 0
let defects = 0
let currentBatchId = ''
let productIndex = 0
let lastInspectionMinutesAgo = 0
let batchSequence = 0

function generateNewBatchId(): string {
  const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  batchSequence += 1
  return `BATCH-${yyyymmdd}-${String(batchSequence).padStart(3, '0')}`
}

function getEl(id: string): HTMLElement {
  return document.getElementById(id)!
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function tick() {
  if (actual >= TARGET) {
    actual = 0
    defects = 0
    currentBatchId = generateNewBatchId()
    productIndex = (productIndex + 1) % PRODUCTS.length
    lastInspectionMinutesAgo = 0
  }

  const producedThisTick = randomInt(2, 5)
  actual = Math.min(actual + producedThisTick, TARGET)
  if (Math.random() < 0.08) defects += 1
  lastInspectionMinutesAgo = Math.min(lastInspectionMinutesAgo + 1, 59)

  const remaining = TARGET - actual
  const progress = Math.min((actual / TARGET) * 100, 100)
  const passed = actual - defects
  const passRate = actual > 0 ? ((passed / actual) * 100).toFixed(1) : '100.0'
  const qualityScore =
    actual > 0 ? Math.max(0, Math.round(100 - (defects / actual) * 50)) : 100
  const lastInspectionText =
    lastInspectionMinutesAgo === 0
      ? 'Just now'
      : `${lastInspectionMinutesAgo} min ago`

  const statusEl = getEl('operator-machine-status')
  statusEl.textContent = actual >= TARGET ? 'Cycle complete' : 'Running'
  statusEl.className =
    'text-4xl font-semibold mt-2 ' +
    (actual >= TARGET ? 'text-blue-400' : 'text-green-400')

  if (!currentBatchId) currentBatchId = generateNewBatchId()
  getEl('operator-batch').textContent = currentBatchId
  getEl('operator-product').textContent = PRODUCTS[productIndex]
  getEl('operator-target').textContent = String(TARGET)
  getEl('operator-actual').textContent = String(actual)
  getEl('operator-remaining').textContent = String(remaining)

  const bar = getEl('operator-progress-bar')
  bar.style.width = `${progress}%`
  getEl('operator-progress-percent').textContent = `${progress.toFixed(1)}%`

  getEl('operator-quality-pass-rate').textContent = `${passRate}%`
  getEl('operator-quality-defects').textContent = String(defects)
  getEl('operator-quality-score').textContent = `${qualityScore}`
  getEl('operator-last-inspection').textContent = lastInspectionText
}

function startUpdates() {
  if (intervalId) return
  tick()
  intervalId = setInterval(tick, UPDATE_INTERVAL_MS)
}

function stopUpdates() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function updateSensorData(state: ReturnType<typeof getState>) {
  getEl('sensor-temperature').textContent =
    state.temperature !== null
      ? `${Math.round(state.temperature)}°C`
      : 'No Data'
  getEl('sensor-humidity').textContent =
    state.humidity !== null ? `${Math.round(state.humidity)}%` : 'No Data'
  getEl('sensor-air-pressure').textContent =
    state.airPressure !== null
      ? `${Math.round(state.airPressure)} hPa`
      : 'No Data'
}

function onStateChange(state: ReturnType<typeof getState>) {
  if (state.currentScreen === 'operator') {
    startUpdates()
  } else {
    stopUpdates()
  }
  updateSensorData(state)
}

export function initOperatorDashboard() {
  subscribe(onStateChange)
  const state = getState()
  if (state.currentScreen === 'operator') startUpdates()
  updateSensorData(state)
}

export function updateOperatorDashboard() {
  tick()
}
