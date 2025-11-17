import type { ThemeColors, BrandingConfig } from '../types/index.js'

/**
 * Default theme colors used by Screenly
 */
export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: '#972EFF',
  secondary: '#454BD2',
  tertiary: '#FFFFFF',
  background: '#C9CDD0',
}

/**
 * Get the primary theme color from settings or use default
 */
export function getPrimaryColor(accentColor?: string): string {
  if (!accentColor || accentColor.toLowerCase() === '#ffffff') {
    return DEFAULT_THEME_COLORS.primary
  }
  return accentColor
}

/**
 * Get the secondary theme color based on theme mode
 */
export function getSecondaryColor(
  theme: 'light' | 'dark' | undefined,
  lightColor?: string,
  darkColor?: string,
): string {
  const defaultSecondary = '#adafbe'

  if (theme === 'light') {
    return !lightColor || lightColor.toLowerCase() === '#ffffff'
      ? defaultSecondary
      : lightColor
  } else if (theme === 'dark') {
    return !darkColor || darkColor.toLowerCase() === '#ffffff'
      ? defaultSecondary
      : darkColor
  }

  return DEFAULT_THEME_COLORS.secondary
}

/**
 * Setup theme colors from Screenly settings
 * This function reads from the global screenly object and returns theme colors
 */
export function getThemeColors(): ThemeColors {
  const settings = screenly.settings

  const primary = getPrimaryColor(settings.screenly_color_accent)
  const secondary = getSecondaryColor(
    settings.theme,
    settings.screenly_color_light,
    settings.screenly_color_dark,
  )

  return {
    primary,
    secondary,
    tertiary: DEFAULT_THEME_COLORS.tertiary,
    background: DEFAULT_THEME_COLORS.background,
  }
}

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(colors: ThemeColors): void {
  document.documentElement.style.setProperty('--theme-color-primary', colors.primary)
  document.documentElement.style.setProperty('--theme-color-secondary', colors.secondary)
  document.documentElement.style.setProperty('--theme-color-tertiary', colors.tertiary)
  document.documentElement.style.setProperty('--theme-color-background', colors.background)
}

/**
 * Setup theme by reading from Screenly settings and applying to CSS
 */
export function setupTheme(): ThemeColors {
  const colors = getThemeColors()
  applyThemeColors(colors)
  return colors
}

/**
 * Fetch and process a logo image from a URL
 * Handles SVG, PNG, and JPEG formats
 */
export async function fetchLogoImage(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${fileUrl}, status: ${response.status}`)
  }

  const blob = await response.blob()
  const buffer = await blob.arrayBuffer()
  const uintArray = new Uint8Array(buffer)

  // Get the first 4 bytes for magic number detection
  const hex = Array.from(uintArray.slice(0, 4))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

  // Convert the first few bytes to ASCII for text-based formats like SVG
  const ascii = String.fromCharCode.apply(null, Array.from(uintArray.slice(0, 100)))
  const pngMagicNumber = '89504E47'
  const jpegMagicNumber = 'FFD8FF'

  // Determine file type based on magic number or ASCII text
  if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
    // Convert SVG to Base64
    return new Promise((resolve, reject) => {
      const svgReader = new FileReader()
      svgReader.readAsText(blob)
      svgReader.onloadend = function () {
        try {
          const base64 = btoa(unescape(encodeURIComponent(svgReader.result as string)))
          resolve('data:image/svg+xml;base64,' + base64)
        } catch (error) {
          reject(error)
        }
      }
      svgReader.onerror = () => reject(new Error('Failed to read SVG file'))
    })
  } else if (hex === pngMagicNumber || hex === jpegMagicNumber) {
    // Return URL for PNG or JPEG
    return fileUrl
  } else {
    throw new Error('Unknown image type')
  }
}

/**
 * Setup branding logo from Screenly settings
 * Returns the processed logo URL or empty string if not available
 */
export async function setupBrandingLogo(): Promise<string> {
  const settings = screenly.settings
  const theme = settings.theme || 'light'

  const lightLogo = settings.screenly_logo_light ?? ''
  const darkLogo = settings.screenly_logo_dark ?? ''

  // Determine which logo to use based on theme
  let logoUrl = ''
  let fallbackUrl = ''

  if (theme === 'light') {
    logoUrl = lightLogo
      ? `${screenly.cors_proxy_url}/${lightLogo}`
      : `${screenly.cors_proxy_url}/${darkLogo}`
    fallbackUrl = lightLogo || darkLogo || ''
  } else if (theme === 'dark') {
    logoUrl = darkLogo
      ? `${screenly.cors_proxy_url}/${darkLogo}`
      : `${screenly.cors_proxy_url}/${lightLogo}`
    fallbackUrl = darkLogo || lightLogo
  }

  // Try to fetch the image using the CORS proxy URL
  try {
    return await fetchLogoImage(logoUrl)
  } catch {
    // If CORS fails, try the fallback URL
    try {
      return await fetchLogoImage(fallbackUrl)
    } catch {
      // Return empty string or the fallback URL
      return fallbackUrl ?? ''
    }
  }
}

/**
 * Setup complete branding (theme colors and logo)
 */
export async function setupBranding(): Promise<BrandingConfig> {
  const colors = setupTheme()
  const logoUrl = await setupBrandingLogo()

  return {
    colors,
    logoUrl: logoUrl || undefined,
  }
}

