import {
  getHardware,
  getSettingWithDefault,
  signalReady,
} from '@screenly/edge-apps'
import { Hardware } from '@screenly/edge-apps'
import {
  escapeHtml,
  calculateItemsPerPage,
  getMenuItems,
  MenuItem,
} from './utils'

/**
 * Get the default background image URL
 * Returns a full GitHub URL for Anywhere screens (no relative path support),
 * or a relative path for other hardware
 */
function getDefaultBackgroundImage(): string {
  const hardware = getHardware()
  if (hardware === Hardware.Anywhere) {
    return 'https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/edge-apps/menu-board/assets/pizza.png'
  }
  return 'assets/pizza.png'
}

/**
 * Renders a specific page of menu items
 */
function renderPage(
  page: number,
  menuItems: MenuItem[],
  itemsPerPage: number,
  currency: string,
): void {
  const start = page * itemsPerPage
  const end = start + itemsPerPage
  const pageItems = menuItems.slice(start, end)

  const menuGrid = document.getElementById('menuGrid')
  if (!menuGrid) return

  const fragment = document.createDocumentFragment()
  pageItems.forEach((item) => {
    const itemElement = document.createElement('div')
    itemElement.className = 'menu-item'

    let labelsHtml = ''
    if (item.labels) {
      const labels = item.labels.split(',').map((label) => label.trim())
      labelsHtml = `
        <div class="labels">
          ${labels.map((label) => `<span class="label ${label.toLowerCase()}">${escapeHtml(label)}</span>`).join('')}
        </div>
      `
    }

    itemElement.innerHTML = `
      <h2>${escapeHtml(item.name)}</h2>
      <div class="content">
        <p>${escapeHtml(item.description)}</p>
      </div>
      <div class="price">
        <span class="currency">${escapeHtml(currency)}</span>
        ${escapeHtml(item.price)}
      </div>
      ${labelsHtml}
    `
    fragment.appendChild(itemElement)
  })

  // Disable transitions if hardware is Anywhere screen
  const hardware = getHardware()
  if (hardware === Hardware.Anywhere) {
    menuGrid.innerHTML = ''
    menuGrid.appendChild(fragment)
  } else {
    // Fade out, update content, fade in
    menuGrid.classList.add('fade-out')
    setTimeout(() => {
      menuGrid.innerHTML = ''
      menuGrid.appendChild(fragment)
      menuGrid.classList.remove('fade-out')
    }, 500)
  }
}

/**
 * Initializes the menu board application
 */
function initializeMenuBoard(): void {
  try {
    const menuTitle = getSettingWithDefault<string>(
      'menu_title',
      "Today's Menu",
    )
    const accentColor = getSettingWithDefault<string>(
      'accent_color',
      'rgba(255, 255, 255, 0.95)',
    )
    const backgroundImage = getSettingWithDefault<string>(
      'background_image',
      getDefaultBackgroundImage(),
    )
    const logoUrl = getSettingWithDefault<string>(
      'logo_url',
      'assets/screenly_food.svg',
    )
    const currency = getSettingWithDefault<string>('currency', '$')

    // Set custom accent color if provided
    document.documentElement.style.setProperty('--accent-color', accentColor)

    // Set background image with error handling
    const bgImage = document.getElementById('background') as HTMLImageElement
    if (bgImage) {
      bgImage.onerror = () => {
        console.error('Failed to load background image')
        bgImage.style.display = 'none'
      }
      bgImage.src = backgroundImage
      bgImage.style.display = 'block'
    }

    // Handle logo with error handling
    const logoElement = document.getElementById('logo') as HTMLImageElement
    if (logoElement) {
      logoElement.onerror = () => {
        console.error('Failed to load logo')
        logoElement.style.display = 'none'
        const header = document.querySelector('.header') as HTMLElement
        if (header) {
          header.style.marginTop = 'var(--spacing-md)'
        }
      }
      if (logoUrl) {
        logoElement.src = logoUrl
        logoElement.style.display = 'block'
      }
    }

    // Set menu title
    const titleElement = document.getElementById('title')
    if (titleElement) {
      titleElement.textContent = menuTitle
    }

    // Get all menu items
    const menuItems = getMenuItems((key: string) =>
      getSettingWithDefault<string | undefined>(key, undefined),
    )

    // Calculate items per page based on viewport
    const itemsPerPage = calculateItemsPerPage()

    // Initial render
    renderPage(0, menuItems, itemsPerPage, currency)

    // Signal that the app is ready
    signalReady()
  } catch (error) {
    console.error('Failed to initialize menu board:', error)
    const errorState = document.getElementById('errorState')
    const menuGrid = document.getElementById('menuGrid')
    if (errorState) {
      errorState.style.display = 'block'
    }
    if (menuGrid) {
      menuGrid.style.display = 'none'
    }
  }
}

// Initialize when the page loads
window.addEventListener('load', () => {
  initializeMenuBoard()
})
