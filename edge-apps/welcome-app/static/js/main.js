/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry */
/* eslint-disable-next-line no-unused-vars, no-useless-catch */

const screenly = {
  settings: {
    welcome_message: 'to the team to the teams s',
    screenly_logo_light: 'static/img/Screenly.svg',
    screenly_logo_dark: 'static/img/Screenly.svg',
    theme: 'light',
    screenly_color_accent: '#7E2CD2',
    screenly_color_light: '#adafbe',
    screenly_color_dark: '#adafbe',
    override_locale: 'en',
    override_timezone: 'Asia/Kolkata',
  },
  metadata: {
    coordinates: [37.774929, -122.419418]
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  const { getNearestCity } = OfflineGeocodeCity
  const allTimezones = moment.tz.names()

  const sentryDsn = screenly.settings.sentry_dsn
  // Initiate Sentry.
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn
    })
  } else {
    console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
  }

  async function initApp () {
    // let clockTimer
    const { metadata, settings } = screenly
    const latitude = metadata.coordinates[0]
    const longitude = metadata.coordinates[1]
    const defaultLocale = navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language

    // Message text from Screenly Settings
    document.querySelector('.welcome-message').innerText = screenly.settings.welcome_message

    const getLocale = async () => {
      const overrideLocale = settings?.override_locale

      if (overrideLocale) {
        if (moment.locales().includes(overrideLocale)) {
          return overrideLocale
        } else {
          console.warn(`Invalid locale: ${overrideLocale}. Using defaults.`)
        }
      }

      const data = await getNearestCity(latitude, longitude)
      const countryCode = data.countryIso2.toUpperCase()

      return clm.getLocaleByAlpha2(countryCode) || defaultLocale
    }

    const getTimezone = async () => {
      const overrideTimezone = settings?.override_timezone
      if (overrideTimezone) {
        if (allTimezones.includes(overrideTimezone)) {
          return overrideTimezone
        } else {
          console.warn(`Invalid timezone: ${overrideTimezone}. Using defaults.`)
        }
      }

      return tzlookup(latitude, longitude)
    }

    const initDateTime = async () => {
      const timezone = await getTimezone()
      const locale = await getLocale()
      const momentObject = moment().tz(timezone)

      if (locale) {
        momentObject.locale(locale) // Set the locale if available
      }

      document.querySelector('.date-text').innerText = momentObject.format('ddd').toUpperCase() // Set the text to the day name
      document.querySelector('.date-number').innerText = momentObject.format('DD') // Set the  text to the numeric day of the month

      // Clock Elements
      const secondsBar = document.querySelector('.seconds-bar')
      const barElement = []
      for (let i = 1; i <= 60; i++) {
        barElement.push(`<span style="--index:${i}"><p></p></span>`)
      }
      secondsBar.insertAdjacentHTML('afterbegin', barElement.join(''))

      // Time
      const handHours = document.querySelector('.hand.hour')
      const handMinutes = document.querySelector('.hand.minute')
      const handSeconds = document.querySelector('.hand.second')

      // Update clock hands every second
      const updateClockHands = () => {
        const momentObject = moment().tz(timezone) // Fetch real-time updates
        const currentHours = momentObject.format('HH') // 24-hour format
        const currentMinutes = momentObject.format('mm') // Minutes
        const currentSeconds = momentObject.format('ss') // Seconds

        // Set rotations for the hands
        handHours.style.transform = `rotate(${currentHours * 30 + currentMinutes / 2}deg)`
        handMinutes.style.transform = `rotate(${currentMinutes * 6}deg)`
        handSeconds.style.transform = `rotate(${currentSeconds * 6}deg)`
      }

      updateClockHands() // Call once initially

      // Call updateClockHands every second
      setInterval(updateClockHands, 1000)
    }

    initDateTime() // Initialize the app
  }

  await initApp()

  // constant colors
  const tertiaryColor = '#FFFFFF'
  const backgroundColor = '#C9CDD0'
  const defaultPrimaryColor = '#7E2CD2'
  let secondaryColor = '#454BD2'

  // Theme Selection
  const theme = screenly.settings.theme ? screenly.settings.theme : 'light'

  // Brand details fetching from settings
  const primaryColor = (!screenly.settings.screenly_color_accent || screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff') ? defaultPrimaryColor : screenly.settings.screenly_color_accent

  if (theme === 'light') {
    secondaryColor = (!screenly.settings.screenly_color_light || screenly.settings.screenly_color_light.toLowerCase() === '#ffffff') ? '#adafbe' : screenly.settings.screenly_color_light
  } else if (theme === 'dark') {
    secondaryColor = (!screenly.settings.screenly_color_dark || screenly.settings.screenly_color_dark.toLowerCase() === '#ffffff') ? '#adafbe' : screenly.settings.screenly_color_dark
  }

  document.documentElement.style.setProperty('--theme-color-primary', primaryColor)
  document.documentElement.style.setProperty('--theme-color-secondary', secondaryColor)
  document.documentElement.style.setProperty('--theme-color-tertiary', tertiaryColor)
  document.documentElement.style.setProperty('--theme-color-background', backgroundColor)

  // Get the logo image element
  const imgElement = document.getElementById('brand-logo')

  // Initialize variables
  let logoUrl = '' // Logo URL
  let fallbackUrl = '' // Fallback logo if CORS URL fails
  const defaultLogo = 'static/img/Screenly.svg' // Fall back screenly logo

  // Define settings
  const lightLogo = screenly.settings.screenly_logo_light
  const darkLogo = screenly.settings.screenly_logo_dark

  // Set logo URLs based on theme
  if (theme === 'light') {
    logoUrl = lightLogo
      ? `${screenly.cors_proxy_url}/${lightLogo}`
      : `${screenly.cors_proxy_url}/${darkLogo}`
    fallbackUrl = lightLogo || darkLogo
  } else if (theme === 'dark') {
    logoUrl = darkLogo
      ? `${screenly.cors_proxy_url}/${darkLogo}`
      : `${screenly.cors_proxy_url}/${lightLogo}`
    fallbackUrl = darkLogo || lightLogo
  }

  // Function to fetch and process the image
  async function fetchImage (fileUrl) {
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image from ${fileUrl}, status: ${response.status}`)
      }

      const blob = await response.blob()
      const buffer = await blob.arrayBuffer()
      const uintArray = new Uint8Array(buffer)

      // Get the first 4 bytes for magic number detection
      const hex = Array.from(uintArray.slice(0, 4))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('').toUpperCase()

      // Convert the first few bytes to ASCII for text-based formats like SVG
      const ascii = String.fromCharCode.apply(null, uintArray.slice(0, 100)) // Check first 100 chars for XML/SVG tags

      // Determine file type based on MIME type, magic number, or ASCII text
      if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
        // Convert to Base64 and display if SVG
        const svgReader = new FileReader()
        svgReader.readAsText(blob)
        svgReader.onloadend = function () {
          const base64 = btoa(unescape(encodeURIComponent(svgReader.result)))
          imgElement.src = 'data:image/svg+xml;base64,' + base64
        }
      } else if (hex === '89504E47' || hex.startsWith('FFD8FF')) {
        // Checking PNG or JPEG/JPG magic number
        imgElement.src = fileUrl
      } else {
        throw new Error('Unknown image type')
      }
    } catch (error) {
      console.error('Error fetching image:', error)
    }
  }

  // First, try to fetch the image using the CORS proxy URL
  try {
    await fetchImage(logoUrl)
  } catch (error) {
    // If CORS fails, try the fallback URL
    try {
      await fetchImage(fallbackUrl)
    } catch (fallbackError) {
      // If fallback fails, use the default logo
      imgElement.src = defaultLogo
    }
  }

  // Signal that the screen is ready for rendering
  // screenly.signalReadyForRendering()
})
