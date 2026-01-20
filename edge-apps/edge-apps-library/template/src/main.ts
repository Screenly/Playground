import {
  signalReady,
  getSettingWithDefault,
  getMetadata,
  getFormattedCoordinates,
} from '@screenly/edge-apps'
// Import components to register them as custom elements
// This registers <auto-scaler>, <app-header>, and <edge-app-devtools> web components
import '@screenly/edge-apps/components'
import './styles.css'

// Note: Auto-scaling and dev tools are handled declaratively in index.html
// via <auto-scaler>, <app-header>, and <edge-app-devtools> web components

// Inject dynamic content via DOM APIs (no innerHTML layout)
document.addEventListener('DOMContentLoaded', () => {
  const greetingEl = document.querySelector<HTMLElement>('[data-greeting]')
  const settingNameEl =
    document.querySelector<HTMLElement>('[data-setting-name]')
  const screenNameEl = document.querySelector<HTMLElement>(
    '[data-meta-screen-name]',
  )
  const locationEl =
    document.querySelector<HTMLElement>('[data-meta-location]')
  const coordinatesEl = document.querySelector<HTMLElement>(
    '[data-meta-coordinates]',
  )

  // Read settings and metadata using @screenly/edge-apps helpers
  const helloName = getSettingWithDefault<string>('hello_name', 'Screenly friend')
  const metadata = getMetadata()
  const formattedCoordinates = getFormattedCoordinates()

  if (greetingEl) {
    greetingEl.textContent = `Hello, ${helloName}`
  }

  if (settingNameEl) {
    settingNameEl.textContent = helloName
  }

  if (screenNameEl) {
    screenNameEl.textContent = metadata.screen_name
  }

  if (locationEl) {
    locationEl.textContent = metadata.location
  }

  if (coordinatesEl) {
    coordinatesEl.textContent = formattedCoordinates
  }

  // Mark app as ready to prevent FOUC
  const appEl = document.getElementById('app')
  if (appEl) {
    appEl.classList.add('ready')
  }

  // Tell the player we're ready to be shown
  signalReady()
})

