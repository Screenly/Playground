import './css/style.css'
import panic from 'panic-overlay'
import { initializePowerBI } from './services'

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
