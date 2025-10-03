/* global Alpine, icons, moment, clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry */
/* eslint-disable no-unused-vars */

const DEFAULT_LOGO_URL = 'static/images/screenly.svg'

// nico: temporary comment; will delete later

// AppCache
class AppCache {
  constructor({ keyName }) {
    this.keyName = keyName

    if (localStorage.getItem(this.keyName) === null) {
      this.data = {}
      localStorage.setItem(this.keyName, JSON.stringify(this.data))
    } else {
      this.data = JSON.parse(localStorage.getItem(this.keyName))
      console.debug('Database setup complete')
    }
  }

  clear() {
    this.data = {}
    localStorage.removeItem(this.keyName)
  }

  set(data) {
    this.data = data
    localStorage.setItem(this.keyName, JSON.stringify(this.data))
  }

  get() {
    return this.data
  }
}

// getReverseGeocodingData - Get city info from coordinates
async function getReverseGeocodingData(context) {
  const stringifyQueryParams = (params) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  }

  const endpointUrl = 'https://api.openweathermap.org/geo/1.0/reverse'

  const queryParams = stringifyQueryParams({
    lat: context.lat,
    lon: context.lng,
    limit: 1,
    appid: context.apiKey,
  })

  let result
  const appCache = new AppCache({ keyName: 'location' })

  try {
    const response = await fetch(`${endpointUrl}?${queryParams}`)
    const data = await response.json()

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('No location data found for the provided coordinates')
    }

    const { name, country, state } = data[0] || {}
    if (!name || !country) {
      throw new Error('Incomplete location data received')
    }

    const timestamp = String(new Date())

    result = { name, country, state, timestamp }

    appCache.clear()
    appCache.set(result)
  } catch (error) {
    console.error('Reverse geocoding error:', error)

    result = appCache.get() || {}

    const requiredKeys = ['name', 'country']
    const isComplete = requiredKeys.every((key) => {
      return Object.prototype.hasOwnProperty.call(result, key)
    })

    if (!isComplete) {
      // Fallback to a generic location if no cached data
      result = {
        name: 'Unknown Location',
        country: 'N/A',
        state: null,
        timestamp: String(new Date()),
      }
    }
  }

  return result
}

// getWeatherApiData - Get weather forecast data only
async function getWeatherApiData(context) {
  const stringifyQueryParams = (params) => {
    return Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')
  }

  const endpointUrl = 'https://api.openweathermap.org/data/2.5/forecast'

  const queryParams = stringifyQueryParams({
    lat: context.lat,
    lon: context.lng,
    units: 'metric',
    cnt: 10,
    appid: context.apiKey,
  })

  let result
  const appCache = new AppCache({ keyName: 'weather' })

  try {
    const response = await fetch(`${endpointUrl}?${queryParams}`)
    const data = await response.json()

    if (data.cod !== '200') {
      throw new Error(data.message)
    }

    context.error = false

    appCache.clear()
    // Only extract weather data and timezone, not city info
    const {
      city: { timezone },
      list,
    } = data

    const timestamp = String(new Date())

    result = { timezone, list, timestamp }

    appCache.set(result)
  } catch (error) {
    console.error('Weather API error:', error)

    result = appCache.get()

    const requiredKeys = ['timezone', 'list']
    const isComplete = requiredKeys.every((key) => {
      return Object.prototype.hasOwnProperty.call(result, key)
    })

    context.error = !isComplete
    context.errorMessage = error.message
  }

  return result
}

function formatTime(today, locale) {
  moment.locale(locale)
  const is24HourFormat = moment
    .localeData(locale)
    .longDateFormat('LT')
    .includes('H')

  return moment(today).format(is24HourFormat ? 'HH:mm' : 'hh:mm A')
}

async function getLocale(lat, lng) {
  const { settings } = screenly
  const defaultLocale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language

  const overrideLocale = settings?.override_locale

  if (overrideLocale) {
    if (moment.locales().includes(overrideLocale)) {
      return overrideLocale
    } else {
      console.warn(`Invalid locale: ${overrideLocale}. Using defaults.`)
    }
  }

  const data = await OfflineGeocodeCity.getNearestCity(lat, lng)
  const countryCode = data.countryIso2.toUpperCase()

  return clm.getLocaleByAlpha2(countryCode) || defaultLocale
}

function findCurrentWeatherItem(list) {
  const currentUTC = Math.round(new Date().getTime() / 1000)
  let itemIndex = 0

  while (itemIndex < list.length - 1 && list[itemIndex].dt < currentUTC) {
    itemIndex++
  }

  if (itemIndex > 0) {
    const timeDiffFromPrev = currentUTC - list[itemIndex - 1].dt
    const timeDiffFromCurrent = list[itemIndex].dt - currentUTC

    if (timeDiffFromPrev < timeDiffFromCurrent) {
      itemIndex = itemIndex - 1
    }
  }

  return itemIndex
}

function checkIfNight(context, dt) {
  const dateTime = moment.unix(dt).utcOffset(context.tzOffset)
  const hrs = dateTime.hour()

  return hrs <= 5 || hrs >= 20
}

function checkIfInRange(ranges, code) {
  return ranges.reduce(
    (acc, range) => acc || (code >= range[0] && code <= range[1]),
  )
}

function getWeatherImagesById(context, id = 800, dt) {
  // List of codes - https://openweathermap.org/weather-conditions
  const isNight = checkIfNight(context, dt)
  let icon

  if (id >= 200 && id <= 299) {
    icon = 'thunderstorm'
  }

  if (id >= 300 && id <= 399) {
    icon = 'drizzle'
  }

  if (id >= 500 && id <= 599) {
    icon = 'rain'
  }

  if (id >= 600 && id <= 699) {
    icon = 'snow'
  }

  if (id >= 700 && id <= 799) {
    // Handle all 7xx cases
    icon = 'haze'
  }

  if (id === 800) {
    icon = 'clear'
  }

  if (id === 801) {
    icon = 'partially-cloudy'
  }

  if (id >= 802 && id <= 804) {
    icon = 'mostly-cloudy'
  }

  return {
    icon: isNight && hasNightPair(icon) ? `${icon}-night` : icon,
  }

  // Helper function to check if an icon has a night pair
  function hasNightPair(icon) {
    const noNightPairIcons = [
      'chancesleet',
      'cloudy',
      'drizzle',
      'fewdrops',
      'fog',
      'haze',
      'snow',
      'windy',
    ]
    return !noNightPairIcons.includes(icon)
  }
}

/**
 * Countries using F scale
 * United States
 * Bahamas.
 * Cayman Islands.
 * Liberia.
 * Palau.
 * The Federated States of Micronesia.
 * Marshall Islands.
 */

const countriesUsingFahrenheit = ['US', 'BS', 'KY', 'LR', 'PW', 'FM', 'MH']
const celsiusToFahrenheit = (temp) => 1.8 * temp + 32
const getTemp = (context, temp) => {
  return Math.round(
    context.tempScale === 'C' ? temp : celsiusToFahrenheit(temp),
  )
}

async function refreshWeather(context) {
  try {
    // Get location data and weather data separately
    const [locationData, weatherData] = await Promise.all([
      getReverseGeocodingData(context),
      getWeatherApiData(context),
    ])

    // Handle location data
    if (locationData && locationData.name) {
      // We only want to set these values once.
      if (!context.firstFetchComplete) {
        const { name, country } = locationData
        // Display only city name and country
        context.city = `${name}, ${country}`
        context.tempScale = countriesUsingFahrenheit.includes(country)
          ? 'F'
          : 'C'
      }
    }

    // Handle weather data
    if (weatherData && weatherData.list !== undefined) {
      const { timezone: tzOffset, list } = weatherData

      // We only want to set these values once.
      if (!context.firstFetchComplete) {
        context.tzOffset = parseInt(tzOffset / 60) // in minutes
        context.firstFetchComplete = true
        context.isLoading = false
      }

      const currentIndex = findCurrentWeatherItem(list)
      const {
        dt,
        weather,
        main: { temp },
      } = list[currentIndex]

      if (Array.isArray(weather) && weather.length > 0) {
        const { id, description } = weather[0]
        const { icon } = getWeatherImagesById(context, id, dt)

        context.currentWeatherIcon = icons[icon]
        context.currentWeatherStatus = description
        context.currentTemp = getTemp(context, temp)
        context.currentFormattedTempScale = `\u00B0${context.tempScale}`
        context.currentWeatherId = id
      }

      const windowSize = window.matchMedia('(orientation: portrait)').matches
        ? 4
        : 7
      const currentWindow = list.slice(
        currentIndex + 1,
        currentIndex + 1 + windowSize,
      )

      context.forecastedItems = await Promise.all(
        currentWindow.map(async (item, index) => {
          const {
            dt,
            main: { temp },
            weather,
          } = item
          const { icon } = getWeatherImagesById(context, weather[0]?.id, dt)
          const dateTime = moment.unix(dt).utcOffset(context.tzOffset)
          const locale = await getLocale(context.lat, context.lng)

          return {
            id: index,
            temp: getTemp(context, temp),
            icon: icons[icon],
            time: formatTime(dateTime, locale),
          }
        }),
      )
    }
  } catch (error) {
    console.error('Error refreshing weather data:', error)
    context.error = true
    context.errorMessage = error.message
  }
}

function getWeatherData() {
  return {
    city: '',
    currentDate: '',
    currentFormattedTempScale: '',
    currentTemp: null,
    currentWeatherIcon: '',
    currentWeatherId: 0,
    currentWeatherStatus: '',
    error: false,
    errorMessage: '',
    firstFetchComplete: false,
    forecastedItems: [],
    timeHour: '',
    timeMinutes: '',
    timeAmPm: '',
    dateText: '',
    dateNumber: '',
    showAmPm: true,
    brandLogo: DEFAULT_LOGO_URL,
    async fetchImage(fileUrl) {
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
        const ascii = String.fromCharCode.apply(null, uintArray.slice(0, 100))

        if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
          return new Promise((resolve) => {
            const svgReader = new FileReader()
            svgReader.readAsText(blob)
            svgReader.onloadend = () => {
              const base64 = btoa(
                unescape(encodeURIComponent(svgReader.result)),
              )
              resolve('data:image/svg+xml;base64,' + base64)
            }
          })
        } else if (hex === '89504E47' || hex.startsWith('FFD8FF')) {
          return fileUrl
        } else {
          throw new Error('Unknown image type')
        }
      } catch (error) {
        console.error('Error fetching image:', error)
        throw error
      }
    },
    async initBrandLogo() {
      const corsUrl =
        screenly.cors_proxy_url + '/' + screenly.settings.screenly_logo_dark
      const fallbackUrl = screenly.settings.screenly_logo_dark

      try {
        this.brandLogo = await this.fetchImage(corsUrl)
      } catch (error) {
        try {
          this.brandLogo = await this.fetchImage(fallbackUrl)
        } catch (fallbackError) {
          this.brandLogo = DEFAULT_LOGO_URL
        }
      }
    },
    init: async function () {
      if (screenly.settings.override_coordinates) {
        const coordinates = screenly.settings.override_coordinates
          .split(',')
          .map((coord) => parseFloat(coord.trim()))
        if (
          coordinates.length === 2 &&
          !isNaN(coordinates[0]) &&
          !isNaN(coordinates[1])
        ) {
          ;[this.lat, this.lng] = coordinates
        } else {
          console.warn(
            'Invalid override_coordinates format. Expected "lat,lng"',
          )
        }
      }

      if (!this.lat || !this.lng) {
        ;[this.lat, this.lng] = screenly.metadata?.coordinates || [0, 0]
      }

      this.apiKey = screenly.settings.openweathermap_api_key

      await this.initDateTime()
      setInterval(() => this.initDateTime(), 1000)

      // Load weather data
      await refreshWeather(this)
      setInterval(
        () => {
          refreshWeather(this)
        },
        1000 * 60 * 15, // 15 minutes
      )

      // Load brand logo
      await this.initBrandLogo()

      // Signal that the app is ready for rendering after everything is loaded
      screenly.signalReadyForRendering()
    },
    getTimezone: async function () {
      return tzlookup(this.lat, this.lng)
    },
    initDateTime: async function () {
      const timezone = await this.getTimezone()
      const locale = await getLocale(this.lat, this.lng)
      const momentObject = moment().tz(timezone)

      if (locale) {
        momentObject.locale(locale)
      }

      const dayOfMonth = momentObject.format('D')
      const formattedTime = formatTime(momentObject, locale)
      const [hours, minutes] = formattedTime.split(' ')[0].split(':')
      const ampm = formattedTime.split(' ')[1] || ''

      // Update time values
      this.timeHour = hours
      this.timeMinutes = minutes
      this.showAmPm = !!ampm
      this.timeAmPm = ampm
      this.dateText = momentObject.format('ddd').toUpperCase()
      this.dateNumber = dayOfMonth
    },
    isLoading: true,
    lat: 0,
    lng: 0,
    settings: {},
    tempScale: 'C',
    tzOffset: 0,
  }
}

document.addEventListener('alpine:init', () => {
  Alpine.data('weather', getWeatherData)
})

document.addEventListener('DOMContentLoaded', async () => {
  const sentryDsn = screenly.settings.sentry_dsn
  // Initiate Sentry.
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
    })
  } else {
    console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
  }

  // constant colors
  const tertiaryColor = '#FFFFFF'
  const backgroundColor = '#C9CDD0'

  // Brand details fetching from settings
  const primaryColor =
    !screenly.settings.screenly_color_accent ||
    screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff'
      ? '#7e2cd2'
      : screenly.settings.screenly_color_accent
  const secondaryColor =
    !screenly.settings.screenly_color_light ||
    screenly.settings.screenly_color_light.toLowerCase() === '#ffffff'
      ? '#454bd2'
      : screenly.settings.screenly_color_light

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

  // Change the color of circles inside SVG objects
  const svgObjects = document.querySelectorAll('#location-pin-icon')
  svgObjects.forEach(function (svgObject) {
    svgObject.addEventListener('load', function () {
      const svgDoc = this.contentDocument
      const path = svgDoc.querySelector('path')
      if (path) {
        path.setAttribute('fill', secondaryColor)
      }
    })
  })
})
