import { initEdgeApp } from '@screenly/edge-apps'
import './styles.css'

// 1) Initialize the Edge App layout
// - Scales a 1920x1080 design to any screen
// - Applies a 5% safe zone on all sides to avoid overscan
initEdgeApp('app', {
  referenceWidth: 1920,
  referenceHeight: 1080,
  orientation: 'auto',
  enableDevTools: true,
  safeZone: { all: '5%' },
})

// 2) Inject only dynamic content via DOM APIs (no innerHTML layout)
document.addEventListener('DOMContentLoaded', () => {
  // Example of dynamic content: you can swap title / subtitle based on settings
  const titleEl = document.getElementById('app-title')
  const subtitleEl = document.getElementById('app-subtitle')

  // You can still access Screenly globals directly if needed:
  // const settings = screenly.settings
  // const metadata = screenly.metadata

  if (titleEl) {
    titleEl.textContent = '{{APP_TITLE}}'
  }

  if (subtitleEl) {
    subtitleEl.textContent =
      'This is a minimal TypeScript + Tailwind CSS Edge App.'
  }

  // 3) Tell the player we're ready to be shown
  // We call the global here so this blueprint only depends on the core module.
  screenly.signalReadyForRendering()
})

