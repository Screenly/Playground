import { signalReady } from '@screenly/edge-apps'
// Import components to register them as custom elements
// This registers <auto-scaler> and <edge-app-devtools> web components
import '@screenly/edge-apps/components'
import './styles.css'

// Note: Auto-scaling and dev tools are now handled declaratively in index.html
// via <auto-scaler> and <edge-app-devtools> web components

// Inject only dynamic content via DOM APIs (no innerHTML layout)
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

  // Tell the player we're ready to be shown
  signalReady()
})

