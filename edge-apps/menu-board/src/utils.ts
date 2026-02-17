import { getHardware, Hardware } from '@screenly/edge-apps'
import pizzaImage from '../assets/pizza.png'
import screenlyFoodLogo from '../assets/screenly_food.svg'

const MAX_MENU_ITEMS = 25

/**
 * Escapes HTML characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Calculates how many items should be displayed per page based on viewport width
 */
export function calculateItemsPerPage(viewportWidth?: number): number {
  const width = viewportWidth ?? window.innerWidth
  if (width >= 1920) return 12 // 4 columns * 3 rows
  if (width >= 1600) return 9 // 3 columns * 3 rows
  if (width >= 1200) return 6 // 2 columns * 3 rows
  if (width >= 768) return 3 // 1 columns * 3 rows
  return 3 // 1 column * 3 rows
}

export interface MenuItem {
  name: string
  description: string
  price: string
  labels: string
}

/**
 * Get the default background image URL
 * Returns a full GitHub URL for Anywhere screens (no relative path support),
 * or a relative path for other hardware
 */
export function getDefaultBackgroundImage(): string {
  if (getHardware() === Hardware.Anywhere) {
    return 'https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/edge-apps/menu-board/assets/pizza.png'
  }
  return pizzaImage
}

/**
 * Get the default logo URL
 * Returns a full GitHub URL for Anywhere screens (no relative path support),
 * or a relative path for other hardware
 */
export function getDefaultLogoUrl(): string {
  if (getHardware() === Hardware.Anywhere) {
    return 'https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/edge-apps/menu-board/assets/screenly_food.svg'
  }
  return screenlyFoodLogo
}

/**
 * Retrieves all menu items from settings
 * Note: This function depends on getSetting from @screenly/edge-apps
 */
export function getMenuItems(
  getSetting: (key: string) => string | undefined,
): MenuItem[] {
  const menuItems: MenuItem[] = []

  for (let i = 1; i <= MAX_MENU_ITEMS; i++) {
    const itemNum = String(i).padStart(2, '0')
    const name = getSetting(`item_${itemNum}_name`)
    if (name?.trim()) {
      menuItems.push({
        name: name.trim(),
        description: getSetting(`item_${itemNum}_description`)?.trim() || '',
        price: getSetting(`item_${itemNum}_price`)?.trim() || '',
        labels: getSetting(`item_${itemNum}_labels`)?.trim() || '',
      })
    }
  }

  return menuItems
}
