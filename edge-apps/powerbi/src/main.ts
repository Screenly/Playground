import './css/style.css'
import panic from 'panic-overlay'
import { setupSentry } from '@screenly/edge-apps/utils'
import { initializePowerBI } from './services'

setupSentry('powerbi', { powerbi: { embed_url: screenly.settings.embed_url } })

panic.configure({
  handleErrors: screenly.settings.display_errors === 'true' || false,
})
if (screenly.settings.display_errors === 'true') {
  window.addEventListener('error', screenly.signalReadyForRendering)
  window.addEventListener(
    'unhandledrejection',
    screenly.signalReadyForRendering,
  )
}

initializePowerBI()
