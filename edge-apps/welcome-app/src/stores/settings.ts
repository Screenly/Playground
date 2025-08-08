import { ref } from 'vue'

export interface WelcomeSettings {
  welcome_heading?: string
  welcome_message?: string
  theme?: 'light' | 'dark'
  override_locale?: string
  override_timezone?: string
  sentry_dsn?: string
  screenly_color_accent?: string
  screenly_color_light?: string
  screenly_color_dark?: string
  screenly_logo_light?: string
  screenly_logo_dark?: string
}

export const useSettingsStore = () => {
  const currentTimezone = ref('UTC')
  const currentLocale = ref('en')
  const settings = ref<WelcomeSettings>({})

  const init = () => {
    if (typeof screenly !== 'undefined' && screenly.settings) {
      settings.value = screenly.settings as WelcomeSettings
    }
  }

  const initTimezone = async (latitude: number, longitude: number) => {
    const overrideTimezone = settings.value.override_timezone

    if (overrideTimezone) {
      // Validate timezone
      try {
        Intl.DateTimeFormat(undefined, { timeZone: overrideTimezone })
        currentTimezone.value = overrideTimezone
        return
      } catch (error) {
        console.warn(`Invalid timezone: ${overrideTimezone}. Using fallback.`)
      }
    }

    // Fallback timezone detection based on coordinates
    try {
      // Simple timezone estimation based on longitude
      // This is a basic implementation - the HTML version uses tzlookup library
      const timezoneOffset = Math.round(longitude / 15)
      const utcOffset = timezoneOffset >= 0 ? `+${timezoneOffset.toString().padStart(2, '0')}:00` : `${timezoneOffset.toString().padStart(3, '0')}:00`

      // Try to get timezone from Intl
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
      currentTimezone.value = timeZone || 'UTC'
    } catch (error) {
      console.warn('Could not determine timezone, using UTC')
      currentTimezone.value = 'UTC'
    }
  }

  const initLocale = async (latitude: number, longitude: number) => {
    const overrideLocale = settings.value.override_locale

    if (overrideLocale) {
      // Check if locale is supported
      try {
        new Intl.DateTimeFormat(overrideLocale)
        currentLocale.value = overrideLocale
        return
      } catch (error) {
        console.warn(`Invalid locale: ${overrideLocale}. Using fallback.`)
      }
    }

    // Get default locale from browser
    const defaultLocale = navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language || 'en'

    currentLocale.value = defaultLocale
  }

  const getThemeColors = () => {
    const theme = settings.value.theme || 'light'
    const defaultPrimaryColor = '#7E2CD2'
    const tertiaryColor = '#FFFFFF'
    const backgroundColor = '#C9CDD0'

    let secondaryColor = '#454BD2'
    const primaryColor = (!settings.value.screenly_color_accent ||
      settings.value.screenly_color_accent.toLowerCase() === '#ffffff')
      ? defaultPrimaryColor
      : settings.value.screenly_color_accent

    if (theme === 'light') {
      secondaryColor = (!settings.value.screenly_color_light ||
        settings.value.screenly_color_light.toLowerCase() === '#ffffff')
        ? '#adafbe'
        : settings.value.screenly_color_light
    } else if (theme === 'dark') {
      secondaryColor = (!settings.value.screenly_color_dark ||
        settings.value.screenly_color_dark.toLowerCase() === '#ffffff')
        ? '#adafbe'
        : settings.value.screenly_color_dark
    }

    return {
      primary: primaryColor,
      secondary: secondaryColor,
      tertiary: tertiaryColor,
      background: backgroundColor
    }
  }

  const applyThemeColors = () => {
    const colors = getThemeColors()

    document.documentElement.style.setProperty('--theme-color-primary', colors.primary)
    document.documentElement.style.setProperty('--theme-color-secondary', colors.secondary)
    document.documentElement.style.setProperty('--theme-color-tertiary', colors.tertiary)
    document.documentElement.style.setProperty('--theme-color-background', colors.background)
  }

  const getBrandLogoUrl = () => {
    const theme = settings.value.theme || 'light'
    const lightLogo = settings.value.screenly_logo_light
    const darkLogo = settings.value.screenly_logo_dark
    const defaultLogo = '/src/assets/images/screenly.svg'

    let logoUrl = ''

    if (theme === 'light') {
      logoUrl = lightLogo
        ? `${(window as any).screenly?.cors_proxy_url}/${lightLogo}`
        : darkLogo
        ? `${(window as any).screenly?.cors_proxy_url}/${darkLogo}`
        : defaultLogo
    } else if (theme === 'dark') {
      logoUrl = darkLogo
        ? `${(window as any).screenly?.cors_proxy_url}/${darkLogo}`
        : lightLogo
        ? `${(window as any).screenly?.cors_proxy_url}/${lightLogo}`
        : defaultLogo
    }

    return logoUrl || defaultLogo
  }

  return {
    currentTimezone,
    currentLocale,
    settings,
    init,
    initTimezone,
    initLocale,
    getThemeColors,
    applyThemeColors,
    getBrandLogoUrl
  }
}
