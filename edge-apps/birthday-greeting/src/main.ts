import './css/style.css'
import {
  setupTheme,
  getSettingWithDefault,
  setupErrorHandling,
  signalReady,
} from '@screenly/edge-apps'
import { isValidBase64Image, formatBase64Image } from './image'

function startApp(): void {
  const name = getSettingWithDefault<string>('name', '')
  const role = getSettingWithDefault<string>('role', '')
  const image = getSettingWithDefault<string>('image', '')

  const nameElement = document.querySelector<HTMLSpanElement>('#person-name')
  if (nameElement) {
    nameElement.textContent = name
  }

  const roleElement =
    document.querySelector<HTMLParagraphElement>('#person-role')
  if (roleElement) {
    roleElement.textContent = role
  }

  const photoElement = document.querySelector<HTMLImageElement>('#person-photo')
  const placeholderElement =
    document.querySelector<HTMLDivElement>('#photo-placeholder')

  if (photoElement && placeholderElement) {
    if (isValidBase64Image(image)) {
      // Attach event handlers BEFORE setting src to avoid race condition
      photoElement.onload = () => {
        signalReady()
      }

      photoElement.onerror = () => {
        photoElement.classList.add('hidden')
        placeholderElement.classList.remove('hidden')
        signalReady()
      }

      // Set src after handlers are attached
      photoElement.src = formatBase64Image(image)
      photoElement.classList.remove('hidden')
      placeholderElement.classList.add('hidden')

      // Check if image already loaded (e.g., from cache)
      if (photoElement.complete) {
        signalReady()
      }
    } else {
      placeholderElement.classList.remove('hidden')
      photoElement.classList.add('hidden')
      signalReady()
    }
  } else {
    signalReady()
  }
}

window.onload = function () {
  setupErrorHandling()
  setupTheme()
  startApp()
}
