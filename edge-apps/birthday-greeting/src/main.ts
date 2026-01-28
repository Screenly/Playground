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

  // Early return if elements are missing
  if (!photoElement || !placeholderElement) {
    throw new Error('Missing photo or placeholder element')
  }

  // Early return if image is invalid - show placeholder
  if (!isValidBase64Image(image)) {
    throw new Error('Invalid image data')
  }

  // Valid image - set up loading
  const imageSrc = formatBase64Image(image)
  photoElement.src = imageSrc
  photoElement.classList.remove('hidden')
  placeholderElement.classList.add('hidden')

  // Check if image loaded synchronously (e.g., from cache or data URI)
  if (photoElement.complete) {
    signalReady()
    return
  }

  // Image loading asynchronously - attach handlers
  photoElement.onload = () => {
    signalReady()
  }

  photoElement.onerror = () => {
    throw new Error('Failed to load image')
  }
}

window.onload = function () {
  setupErrorHandling()
  setupTheme()
  startApp()
}
