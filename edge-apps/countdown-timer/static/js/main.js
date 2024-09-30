/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry */
// eslint-disable-next-line no-unused-vars

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
      const now = moment().tz(timezone)
      const countDate = moment.tz(countdownEndTime, timezone)
      const remainingTime = countDate.diff(now)

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

      setTimeout(countdown, 1000)
    }

    await countdown()
    await initDateTime()

    // constant colors
    const tertiaryColor = '#FFFFFF'
    const backgroundColor = '#C9CDD0'

    // brand details fetching  from settings
    // check if the color fetched from the settings are white, if it's : it will set to default color and fall back to default also the color is not available.

    const primaryColor = (!screenly.settings.screenly_color_accent || screenly.settings.screenly_color_accent === '#ffffff') ? '#972eff' : screenly.settings.screenly_color_accent
    const secondaryColor = (!screenly.settings.screenly_color_light || screenly.settings.screenly_color_light === '#ffffff') ? '#adafbe' : screenly.settings.screenly_color_light

    document.documentElement.style.setProperty('--theme-color-primary', primaryColor)
    document.documentElement.style.setProperty('--theme-color-secondary', secondaryColor)
    document.documentElement.style.setProperty('--theme-color-tertiary', tertiaryColor)
    document.documentElement.style.setProperty('--theme-color-background', backgroundColor)

    // Function to determine the image format based on the initial bytes
    function getImageFormat (buffer) {
      const arr = new Uint8Array(buffer).subarray(0, 4)
      let header = ''
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16)
      }

      switch (header) {
        case '89504e47':
          return 'image/png'
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
          return 'image/jpeg'
        case '3c3f786d':
          return 'image/svg+xml'
        default:
          return 'unknown'
      }
    }

    function setLogoImage () {
      // Brand logo fetch from the setting as without the URL extension, and here we are fining and inserting right extension as per the received image header.
      const logoElement = document.getElementById('brand-logo')
      const defaultLogo = 'static/img/Screenly.svg'
      const logoUrl = screenly.settings.screenly_logo_dark
      if (logoUrl) {
        fetch(logoUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok')
            }
            return response.arrayBuffer()
          })
          .then(buffer => {
            const format = getImageFormat(buffer)
            let formattedUrl = defaultLogo

            if (format === 'image/png') {
              formattedUrl = logoUrl + '.png'
            } else if (format === 'image/jpeg') {
              formattedUrl = logoUrl + '.jpg'
            } else if (format === 'image/svg+xml') {
              formattedUrl = logoUrl + '.svg'
            }

            logoElement.src = formattedUrl
          })
          .catch(error => {
            console.error('Error fetching the image:', error)
            logoElement.src = defaultLogo
          })
      } else {
        logoElement.src = defaultLogo
      }
    }

    // Call the function to set the logo image
    setLogoImage()

    // Change the color of circles inside SVG objects
    const svgObjects = document.querySelectorAll('#svgObject1, #svgObject2, #svgObject3')
    svgObjects.forEach(function (svgObject) {
      svgObject.addEventListener('load', function () {
        const svgDoc = this.contentDocument
        const circle = svgDoc.querySelector('circle')
        if (circle) {
          circle.setAttribute('fill', primaryColor)
        }
      })
    })

    // Signal that the screen is ready for rendering
    screenly.signalReadyForRendering()
  }

  await initApp()
})
