/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry */
/* eslint-disable-next-line no-unused-vars, no-useless-catch */

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
    let clockTimer
    const { metadata, settings } = screenly
    const latitude = metadata.coordinates[0]
    const longitude = metadata.coordinates[1]
    const defaultLocale = navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language

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
      clearTimeout(clockTimer)
      const timezone = await getTimezone()
      const locale = await getLocale()
      const momentObject = moment().tz(timezone)

      if (locale) {
        momentObject.locale(locale) // Set the locale if available
      }

      const dayOfMonth = momentObject.format('D') // Get the day of the month

      // Check if the locale prefers a 24-hour format by checking 'LT'
      const is24HourFormat = moment.localeData(locale).longDateFormat('LT').includes('H')
      // Format time based on the locale's preference
      const formattedTime = is24HourFormat
        ? momentObject.format('HH:mm') // 24-hour format
        : momentObject.format('hh:mm') // 12-hour format

      // Handle AM/PM for 12-hour format
      const periodElement = document.querySelector('.secondary-card-time-am-pm')
      if (is24HourFormat) {
        periodElement.innerText = '' // Clear AM/PM value in 24-hour format
        periodElement.style.display = 'none' // Optionally hide the element
      } else {
        const period = momentObject.format('A') // Get AM/PM for 12-hour format
        periodElement.innerText = period
        periodElement.style.display = 'inline' // Ensure it's visible
      }

      document.querySelector('.date-text').innerText = momentObject.format('ddd').toUpperCase()
      document.querySelector('.date-number').innerText = dayOfMonth // Set the inner text to the numeric day of the month

      // Set time in card
      document.querySelector('.secondary-card-number').innerText = formattedTime
      // Set Clock Time

      // const numberHours = document.querySelector('.number-hours')
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

      // Set a timeout to call initDateTime every 1 seconds for date and clock update
      clockTimer = setTimeout(initDateTime, 1000)
    }

    initDateTime() // Initialize the app
  }

  await initApp()

  // constant colors
  const tertiaryColor = '#FFFFFF'
  const backgroundColor = '#C9CDD0'

  // Brand details fetching from settings
  const primaryColor = (!screenly.settings.screenly_color_accent || screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff') ? '#972eff' : screenly.settings.screenly_color_accent
  const secondaryColor = (!screenly.settings.screenly_color_light || screenly.settings.screenly_color_light.toLowerCase() === '#ffffff') ? '#adafbe' : screenly.settings.screenly_color_light

  document.documentElement.style.setProperty('--theme-color-primary', primaryColor)
  document.documentElement.style.setProperty('--theme-color-secondary', secondaryColor)
  document.documentElement.style.setProperty('--theme-color-tertiary', tertiaryColor)
  document.documentElement.style.setProperty('--theme-color-background', backgroundColor)

  // Brand Image Setting

  const imgElement = document.getElementById('brand-logo')
  const corsUrl = screenly.cors_proxy_url + '/' + screenly.settings.screenly_logo_dark
  const fallbackUrl = screenly.settings.screenly_logo_dark
  const defaultLogo = 'static/img/Screenly.svg'

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
    await fetchImage(corsUrl)
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
  screenly.signalReadyForRendering()
})