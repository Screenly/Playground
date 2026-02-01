import { ref } from 'vue'
import {
  getSettings,
  getSettingWithDefault,
  getTheme,
  getCorsProxyUrl,
} from '../../utils/settings.js'

// eslint-disable-next-line max-lines-per-function
export const baseSettingsStoreSetup = () => {
  const settings = ref(getSettings())
  const primaryThemeColor = ref('')
  const secondaryThemeColor = ref('')
  const tertiaryThemeColor = ref('')
  const backgroundThemeColor = ref('')
  const brandLogoUrl = ref('')

  const setupTheme = () => {
    const tertiaryColor = '#FFFFFF'
    const backgroundColor = '#C9CDD0'
    const defaultPrimaryColor = '#972EFF'
    let secondaryColor = '#454BD2'

    const accentColor = getSettingWithDefault<string>(
      'screenly_color_accent',
      '',
    )
    const primaryColor =
      !accentColor || accentColor.toLowerCase() === '#ffffff'
        ? defaultPrimaryColor
        : accentColor

    const theme = getTheme()
    if (theme === 'light') {
      const lightColor = getSettingWithDefault<string>(
        'screenly_color_light',
        '',
      )
      secondaryColor =
        !lightColor || lightColor.toLowerCase() === '#ffffff'
          ? '#adafbe'
          : lightColor
    } else if (theme === 'dark') {
      const darkColor = getSettingWithDefault<string>('screenly_color_dark', '')
      secondaryColor =
        !darkColor || darkColor.toLowerCase() === '#ffffff'
          ? '#adafbe'
          : darkColor
    }

    document.documentElement.style.setProperty(
      '--theme-color-primary',
      primaryColor,
    )
    document.documentElement.style.setProperty(
      '--theme-color-secondary',
      secondaryColor,
    )
    document.documentElement.style.setProperty(
      '--theme-color-tertiary',
      tertiaryColor,
    )
    document.documentElement.style.setProperty(
      '--theme-color-background',
      backgroundColor,
    )

    primaryThemeColor.value = primaryColor
    secondaryThemeColor.value = secondaryColor
    tertiaryThemeColor.value = tertiaryColor
    backgroundThemeColor.value = backgroundColor
  }

  // eslint-disable-next-line max-lines-per-function
  const setupBrandingLogo = async () => {
    const theme = getTheme() || 'light'
    const corsProxyUrl = getCorsProxyUrl()

    // Define settings
    const lightLogo = getSettingWithDefault<string>('screenly_logo_light', '')
    const darkLogo = getSettingWithDefault<string>('screenly_logo_dark', '')

    // Set logo URLs based on theme
    let logoUrl = ''
    let fallbackUrl = ''

    if (theme === 'light') {
      logoUrl = lightLogo
        ? `${corsProxyUrl}/${lightLogo}`
        : `${corsProxyUrl}/${darkLogo}`
      fallbackUrl = lightLogo || darkLogo || ''
    } else if (theme === 'dark') {
      logoUrl = darkLogo
        ? `${corsProxyUrl}/${darkLogo}`
        : `${corsProxyUrl}/${lightLogo}`
      fallbackUrl = darkLogo || lightLogo
    }

    // Function to fetch and process the image
    const fetchImage = async (fileUrl: string): Promise<string> => {
      try {
        const response = await fetch(fileUrl)
        if (!response.ok) {
          throw new Error(
            `Failed to fetch image from ${fileUrl}, status: ${response.status}`,
          )
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
        const ascii = String.fromCharCode(
          ...Array.from(uintArray.slice(0, 100)),
        ) // Check first 100 chars for XML/SVG tags
        const pngMagicNumber = '89504E47'
        const jpegMagicNumber = 'FFD8FF'

        // Determine file type based on MIME type, magic number, or ASCII text
        if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
          // Convert to Base64 using FileReader like the original
          return new Promise((resolve, reject) => {
            const svgReader = new FileReader()
            svgReader.readAsText(blob)
            svgReader.onloadend = function () {
              try {
                const base64 = btoa(
                  unescape(encodeURIComponent(svgReader.result as string)),
                )
                resolve('data:image/svg+xml;base64,' + base64)
              } catch (error) {
                reject(error)
              }
            }
            svgReader.onerror = () =>
              reject(new Error('Failed to read SVG file'))
          })
        } else if (hex === pngMagicNumber || hex === jpegMagicNumber) {
          // Checking PNG or JPEG/JPG magic number
          return fileUrl
        } else {
          throw new Error('Unknown image type')
        }
      } catch (error) {
        console.error('Error fetching image:', error)
        throw error
      }
    }

    // Try to fetch the image using the CORS proxy URL
    try {
      const processedLogoUrl = await fetchImage(logoUrl)
      brandLogoUrl.value = processedLogoUrl
    } catch {
      // If CORS fails, try the fallback URL
      try {
        const processedFallbackUrl = await fetchImage(fallbackUrl)
        brandLogoUrl.value = processedFallbackUrl
      } catch {
        // Set to empty string so the template uses the imported screenlyLogo
        brandLogoUrl.value = fallbackUrl ?? ''
      }
    }
  }

  return {
    settings,
    primaryThemeColor,
    secondaryThemeColor,
    tertiaryThemeColor,
    backgroundThemeColor,
    brandLogoUrl,
    setupTheme,
    setupBrandingLogo,
  }
}

export type SettingsStore = ReturnType<typeof baseSettingsStoreSetup>
