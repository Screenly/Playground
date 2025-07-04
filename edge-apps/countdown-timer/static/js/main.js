/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry */
// eslint-disable-next-line no-unused-vars, no-useless-catch

const screenly = {
  settings: {
    target_timestamp: '2025-07-03T12:00:00Z',
    countdown_headline: 'New Year Countdown New Year Countdown New Year Countdown New Year Countdown',
    screenly_color_accent: 'blue',
    screenly_color_light: 'red',
    starting_timestamp: '2025-01-03T12:00:00Z',
    countdown_end_text: 'Countdown Finishedsss!',
    override_locale: 'en',
  },
  metadata: {
    coordinates: [40.7128, -74.0060],
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

      document.querySelector('.date-text').innerText = momentObject.format('ddd').toUpperCase()
      document.querySelector('.date-number').innerText = dayOfMonth // Set the inner text to the numeric day of the month

      clockTimer = setTimeout(initDateTime, 10000)
    }

    const countdown = async () => {
      const timerHeadlineText = settings?.countdown_headline
      const countdownEndTime = settings?.target_timestamp
      const timezone = await getTimezone()
      const locale = await getLocale()
      const now = moment().tz(timezone)
      const countDate = moment.tz(countdownEndTime, timezone)
      const remainingTime = countDate.diff(now)

            // Check if countdown has finished
      if (remainingTime <= 0) {
                // Show overlay when countdown is finished
        const overlay = document.getElementById('countdown-overlay')
        if (overlay && overlay.classList.contains('hidden')) {
          overlay.classList.remove('hidden')

          // Update overlay title with countdown_end_text
          const overlayTitle = document.querySelector('.overlay-title')
          if (overlayTitle) {
            overlayTitle.textContent = settings?.countdown_end_text || 'The time has ended'
          }

          // Update starting timestamp in overlay
          const startTimeElement = document.getElementById('overlay-start-time')
          const startingTime = settings?.starting_timestamp
          if (startingTime && startTimeElement) {
            const startTime = moment.tz(startingTime, timezone)
            if (locale) {
              startTime.locale(locale)
            }
            startTimeElement.textContent = startTime.format('LLLL')
          }

          // Update current timestamp in overlay
          const currentTimeElement = document.getElementById('overlay-current-time')
          const currentTime = moment().tz(timezone)
          if (locale) {
            currentTime.locale(locale)
          }
          currentTimeElement.textContent = currentTime.format('LLLL')
        }

        // Set all countdown values to 0
        document.querySelector('.message').innerText = timerHeadlineText
        document.querySelector('.day').innerText = 0
        document.querySelector('.hour').innerText = 0
        document.querySelector('.minute').innerText = 0
        document.querySelector('.second').innerText = 0

        // Continue checking every second in case user wants to start a new countdown
        setTimeout(countdown, 1000)
        return
      }

      // Timer Const
      const second = 1000
      const minute = second * 60
      const hour = minute * 60
      const day = hour * 24

      // Timer Variables.
      const textDay = Math.floor(remainingTime / day)
      const textHour = Math.floor((remainingTime % day) / hour)
      const textMinute = Math.floor((remainingTime % hour) / minute)
      const textSecond = Math.floor((remainingTime % minute) / second)

      // Writing to the corresponding HTML tags
      document.querySelector('.message').innerText = timerHeadlineText
      document.querySelector('.day').innerText = textDay > 0 ? textDay : 0
      document.querySelector('.hour').innerText = textHour > 0 ? textHour : 0
      document.querySelector('.minute').innerText = textMinute > 0 ? textMinute : 0
      document.querySelector('.second').innerText = textSecond > 0 ? textSecond : 0

      // Hide overlay if countdown is running and overlay is visible
      const overlay = document.getElementById('countdown-overlay')
      if (overlay && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden')
      }

      setTimeout(countdown, 1000)
    }

    await countdown()
    await initDateTime()

    // constant colors
    const tertiaryColor = '#FFFFFF'
    const backgroundColor = '#C9CDD0'

    // brand details fetching  from settings
    // check if the color fetched from the settings are white, if it's : it will set to default color and fall back to default also the color is not available.

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
    const defaultLogo = 'static/img/screenly.svg'

    // Function to fetch and process the image
    async function fetchImage (fileUrl) {
      // eslint-disable-next-line no-useless-catch
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
        throw error
        // Rethrow the error to be caught in the main logic
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

    // Change the color of circles inside SVG objects
    const svgIds = ['#clock-icon-1', '#clock-icon-2', '#clock-icon-3'];
    const svgObjects = document.querySelectorAll(svgIds.join(','));

    svgObjects.forEach((svgObject) => {
      // Ensure the SVG is already loaded or wait for it to load
      const handleSVGLoad = () => {
        const svgDoc = svgObject.contentDocument;
        if (!svgDoc) return;

        const circle = svgDoc.querySelector('circle');
        if (circle) {
          circle.setAttribute('fill', primaryColor);
        }
      };

      // If already loaded, apply immediately
      if (svgObject.contentDocument) {
        handleSVGLoad();
      } else {
        svgObject.addEventListener('load', handleSVGLoad);
      }
    });

    // Signal that the screen is ready for rendering
    // screenly.signalReadyForRendering()
  }

  await initApp()
})
