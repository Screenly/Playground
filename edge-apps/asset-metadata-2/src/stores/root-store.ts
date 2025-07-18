import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useScreenlyMetadataStore = defineStore('metadata', () => {
  const metadata = screenly.metadata

  const coordinates = ref(metadata.coordinates ?? '')
  const hostname = ref(metadata.hostname ?? '')
  const screenName = ref(metadata.screen_name ?? '')
  const hardware = ref(metadata.hardware ?? '')
  const location = ref(metadata.location ?? '')
  const screenlyVersion = ref(metadata.screenly_version ?? '')
  const tags = ref(metadata.tags ?? [])

  const formattedCoordinates = computed(() => {
    const [latitude, longitude] = coordinates.value

    const latString = `${Math.abs(latitude).toFixed(4)}\u00B0`
    const latDirection = latitude > 0 ? 'N' : 'S'
    const lngString = `${Math.abs(longitude).toFixed(4)}\u00B0`
    const lngDirection = longitude > 0 ? 'E' : 'W'

    return `${latString} ${latDirection}, ${lngString} ${lngDirection}`
  })

  return {
    coordinates,
    hostname,
    screenName,
    hardware,
    location,
    screenlyVersion,
    tags,
    formattedCoordinates,
  }
})

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref(screenly.settings)
  const primaryThemeColor = ref('')
  const secondaryThemeColor = ref('')
  const tertiaryThemeColor = ref('')
  const backgroundThemeColor = ref('')

  const setupTheme = () => {
    const tertiaryColor = '#FFFFFF'
    const backgroundColor = '#C9CDD0'
    const defaultPrimaryColor = '#972EFF'
    let secondaryColor = '#454BD2'

    const primaryColor =
      !settings.value.screenly_color_accent ||
      settings.value.screenly_color_accent.toLowerCase() === '#ffffff'
        ? defaultPrimaryColor
        : settings.value.screenly_color_accent

    if (settings.value.theme === 'light') {
      secondaryColor =
        !settings.value.screenly_color_light ||
        settings.value.screenly_color_light.toLowerCase() === '#ffffff'
          ? '#adafbe'
          : settings.value.screenly_color_light
    } else if (settings.value.theme === 'dark') {
      secondaryColor =
        !settings.value.screenly_color_dark ||
        settings.value.screenly_color_dark.toLowerCase() === '#ffffff'
          ? '#adafbe'
          : settings.value.screenly_color_dark
    }

    document.documentElement.style.setProperty('--theme-color-primary', primaryColor)
    document.documentElement.style.setProperty('--theme-color-secondary', secondaryColor)
    document.documentElement.style.setProperty('--theme-color-tertiary', tertiaryColor)
    document.documentElement.style.setProperty('--theme-color-background', backgroundColor)

    primaryThemeColor.value = primaryColor
    secondaryThemeColor.value = secondaryColor
    tertiaryThemeColor.value = tertiaryColor
    backgroundThemeColor.value = backgroundColor
  }

  return {
    settings,
    primaryThemeColor,
    secondaryThemeColor,
    tertiaryThemeColor,
    backgroundThemeColor,
    setupTheme,
  }
})
