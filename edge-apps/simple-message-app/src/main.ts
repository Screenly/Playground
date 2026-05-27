import './css/style.css'
import '@screenly/edge-apps/components'
import { setupErrorHandling } from '@screenly/edge-apps'
import init from './app'

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  await init()
})
