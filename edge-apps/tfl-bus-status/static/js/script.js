/* global screenly, Sentry */


const screenly = {
  settings: {
    stop_id: '490000144E',

    tfl_api_token: 'b4c24b35290947b089e509858e55f2f2',
      // tfl_api_token: 'b4c24b35290947b089e509858e55f2f2'
    // sentry_dsn: 'https://sentry.io/1234567890'
    theme: 'dark',
    // screenly_color_accent: '#7E2CD2',
    // screenly_color_light: '#454BD2',
    // screenly_color_dark: '#0032A0',
    screenly_logo_light: 'static/images/Screenly.svg',
    screenly_logo_dark: 'static/images/Screenly.svg',
  }
}

// Constants for bus data configuration

const MAX_BUSES_TO_DISPLAY = 15;
const EMPTY_BUS_DATA = {
  lineName: null,
  destinationName: null,
  timeToStation: null,
  statusSeverity: null
};

// Base URL for the TfL API

const apiUrl = 'https://api.tfl.gov.uk/'
const stopId = screenly.settings.stop_id
const apiKey = screenly.settings.tfl_api_token

// Sentry DSN

const sentryDsn = screenly.settings.sentry_dsn
// Initiate Sentry.

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn
  })
} else {
  console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
}

// Cache keys

const CACHE_KEYS = {
  BUS_DATA: 'tfl_bus_data',
  LINE_STATUS: 'tfl_line_status',
  LAST_UPDATE: 'tfl_last_update',
  STOP_ID: 'tfl_stop_id'
}

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

function clearCacheIfStopIdChanged() {
  const cachedStopId = localStorage.getItem(CACHE_KEYS.STOP_ID)
  if (cachedStopId && cachedStopId !== stopId) {
    // Clear all cache if stop ID has changed

    localStorage.removeItem(CACHE_KEYS.BUS_DATA)
    localStorage.removeItem(CACHE_KEYS.LINE_STATUS)
    localStorage.removeItem(CACHE_KEYS.LAST_UPDATE)
    localStorage.setItem(CACHE_KEYS.STOP_ID, stopId)
    return true
  }
  localStorage.setItem(CACHE_KEYS.STOP_ID, stopId)
  return false
}

async function getCachedData(url, cacheKey) {
  try {
    // Check if stop ID has changed

    if (clearCacheIfStopIdChanged()) {
      // console.log('Stop ID changed, clearing cache')
      return null
    }

    // Check if we have cached data and if it's still valid

    const lastUpdate = localStorage.getItem(CACHE_KEYS.LAST_UPDATE)
    const cachedData = localStorage.getItem(cacheKey)

    if (cachedData && lastUpdate && (Date.now() - parseInt(lastUpdate)) < CACHE_DURATION) {
      return JSON.parse(cachedData)
    }

    // If no valid cache, fetch new data

    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Check TFL API Key')
      } else if (response.status === 404) {
        throw new Error('Invalid stop ID.')
      } else if (response.status === 429) {
        throw new Error('Check TFL API Key')
      } else {
        throw new Error(`Unable to fetch data.`)
      }
    }
    const data = await response.json()

    // Update cache

    localStorage.setItem(cacheKey, JSON.stringify(data))
    localStorage.setItem(CACHE_KEYS.LAST_UPDATE, Date.now().toString())

    return data
  } catch (error) {
    // If fetch fails, try to use cached data even if expired

    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      console.warn('Fetching new data failed, using cached data:', error)
      return JSON.parse(cachedData)
    }
    throw error
  }
}

function busData() {
  return {
    stationName: 'Loading bus information...',
    stationPlatform: '',
    nextBuses: [],
    lineStatuses: {},
    error: null,
    isLoading: true,
    lastUpdate: null,
    updateInterval: null,
    tempData: null,

    // Add a new property to hold temporary data while fetching

    formatArrivalTime(timeToStation) {
      return timeToStation <= 59 ? 'DUE' : Math.floor(timeToStation / 60) + ' MIN'
    },

    formatStationName(name, platform) {
      if (!name) return 'Unknown Station';

      // Format the platform part

      let platformText = '';
      if (platform) {
        const match = platform.match(/[A-Z0-9]+$/);
        platformText = match ? ` (Stop ${match[0]})` : ` (${platform})`;
      }

      // Combine name and platform without trimming or truncation

      return `${name}${platformText}`;
    },

    formatPlatformName(name) {
      if (!name) return '';
      // Extract just the platform letter/number if possible

      const match = name.match(/[A-Z0-9]+$/);
      if (match) {
        return `(Stop ${match[0]})`;
      }
      // If no match, truncate and format

      return name.length > 15 ? `(${name.substring(0, 12)}...)` : `(${name})`;
    },

    async init() {
      try {
        // console.log('Initializing bus data...')

        await this.fetchBusData(true)
        this.isLoading = false

        // Clear any existing interval

        if (this.updateInterval) {
          clearInterval(this.updateInterval)
        }

        // Set up interval for updates - store the reference

        // Update more frequently - every 30 seconds

        this.updateInterval = setInterval(() => {
          // console.log('Scheduled update triggered')

          this.fetchBusData(false)
        }, 30 * 1000)
      } catch (error) {
        //console.error('Initialization error:', error)

        this.error = error.message
        this.stationName = 'Error: Check API Key and Stop ID'
        this.stationPlatform = error.message
        this.isLoading = false
      }
    },

    async fetchBusData(isInitialLoad = false) {
      try {
        // Only show loading state on initial load

        if (isInitialLoad) {
          this.isLoading = true
        }

        // console.log('Fetching bus data at:', new Date().toISOString())

        // Force cache refresh by clearing the cache items

        if (!isInitialLoad) {
          localStorage.removeItem(CACHE_KEYS.BUS_DATA)
          localStorage.removeItem(CACHE_KEYS.LINE_STATUS)
          localStorage.removeItem(CACHE_KEYS.LAST_UPDATE)
        }

        // Fetch bus arrivals

        const stopData = await getCachedData(
          `${apiUrl}StopPoint/${stopId}/Arrivals?app_key=${apiKey}`,
          CACHE_KEYS.BUS_DATA
        )

        // console.log('Raw Bus Arrivals API Response:', stopData)

        if (!Array.isArray(stopData)) {
          throw new Error('Please check your API configuration.')
        }

        // Fetch line statuses

        const lineData = await getCachedData(
          `${apiUrl}Line/Mode/bus/Status?app_key=${apiKey}`,
          CACHE_KEYS.LINE_STATUS
        )

        // console.log('Raw Line Status API Response:', lineData)

        // Sort buses by arrival time

        const sortedBuses = stopData.sort((a, b) => a.timeToStation - b.timeToStation)

        // Get station details with combined formatting

        const newStationName = this.formatStationName(
          sortedBuses[0]?.stationName,
          sortedBuses[0]?.platformName
        )

        // Process next buses and fill with empty rows if needed

        const newNextBuses = sortedBuses.slice(0, MAX_BUSES_TO_DISPLAY).map(bus => ({
          ...bus,
          statusSeverity: lineData[bus.lineId]?.lineStatuses?.[0]?.statusSeverity ?? 19
        }))

        // Fill remaining rows with empty data if needed

        while (newNextBuses.length < MAX_BUSES_TO_DISPLAY) {
          newNextBuses.push({ ...EMPTY_BUS_DATA })
        }

        // Update the UI directly for better responsiveness

        this.stationName = newStationName;
        this.stationPlatform = '';
        this.nextBuses = newNextBuses;
        this.lastUpdate = Date.now();

        //console.log('UI updated with new bus data at:', new Date().toISOString());

      } catch (error) {
        //console.error('Error fetching bus data:', error);

        Sentry.captureException(error)
        this.error = error.message

        // Only update error state if we don't have any existing data

        if (!this.nextBuses.length || this.nextBuses.every(bus => !bus.lineName)) {
          this.stationName = 'Error: Check API Configuration'
          this.stationPlatform = error.message
          // Clear the bus data to show empty state

          this.nextBuses = Array(MAX_BUSES_TO_DISPLAY).fill({ ...EMPTY_BUS_DATA })
        }
      } finally {
        // Only update loading state on initial load

        if (isInitialLoad) {
          this.isLoading = false
        }
      }
    },

    getNumberOfBuses() {
      return MAX_BUSES_TO_DISPLAY;
      // Use the constant instead of hardcoded value
    },

    getStatusMessage(statusSeverity) {
      const statusMap = {
        0: 'ON TIME', // SPECIAL SERVICE
        1: 'CLOSED', // CLOSED
        2: 'SUSP', // SUSPENDED
        3: 'PART SUSP', // PART SUSPENDED
        4: 'PLAN CLOS', // PLANNED CLOSURE
        5: 'PART CLOS', // PART CLOSURE
        6: 'SEV DELAY', // SEVERE DELAY
        7: 'DELAY', // REDUCED SERVICE
        8: 'BUS REPL', // BUS SERVICE
        9: 'MIN DELAY', // MINOR DELAY
        10: 'ON TIME', // ON TIME
        11: 'PART CLOS', // PART CLOSED
        12: 'EXIT ONLY', // EXIT ONLY
        13: 'NO STEP', // NO STEP FREE ACCESS
        14: 'FREQ CHG', // CHANGE OF FREQ
        15: 'DIVERTED', // DIVERTED
        16: 'NOT RUNNING', // NOT RUNNING
        17: 'ISSUES REPORTED', // ISSUES REPORTED
        18: 'ON TIME', // ON TIME
        19: 'NO STATUS' // NO STATUS
      }
      return statusMap[statusSeverity] || 'NO STATUS'
    },

    getStatusClass(statusSeverity) {
      const classMap = {
        0: 'on-time',
        1: 'service-closed',
        2: 'service-closed',
        3: 'service-closed',
        4: 'service-closed',
        5: 'service-closed',
        6: 'severe-delay',
        7: 'has-delayed',
        8: 'unknown-status',
        9: 'has-delayed',
        10: 'on-time',
        11: 'moderate-delay',
        12: 'moderate-delay',
        13: 'unknown-status',
        14: 'unknown-status',
        15: 'unknown-status',
        16: 'has-delayed',
        17: 'has-delayed',
        18: 'unknown-status',
        19: 'unknown-status'
      }
      return classMap[statusSeverity] || 'unknown-status'
    }
  }
}

// Initialize brand settings when DOM is ready

document.addEventListener('DOMContentLoaded', brandFetch)

async function brandFetch() {
  try {
    // constant colors

    const tertiaryColor = '#FFFFFF'
    const backgroundColor = '#C9CDD0'
    const defaultPrimaryColor = '#7E2CD2'
    const defaultSecondaryColor = '#454BD2'

    // Theme Selection

    const theme = screenly.settings.theme ? screenly.settings.theme : 'light'

    // Brand details fetching from settings

    const primaryColor = (!screenly.settings.screenly_color_accent || screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff') ? defaultPrimaryColor : screenly.settings.screenly_color_accent

    let secondaryColor = defaultSecondaryColor
    if (theme === 'light') {
      secondaryColor = (!screenly.settings.screenly_color_light || screenly.settings.screenly_color_light.toLowerCase() === '#ffffff') ? defaultSecondaryColor : screenly.settings.screenly_color_light
    } else if (theme === 'dark') {
      secondaryColor = (!screenly.settings.screenly_color_dark || screenly.settings.screenly_color_dark.toLowerCase() === '#ffffff') ? defaultSecondaryColor : screenly.settings.screenly_color_dark
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
    const defaultLogo = 'static/images/screenly.svg' // Fall back screenly logo

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

    async function fetchImage(fileUrl) {
      try {
        const response = await fetch(fileUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch image from ${fileUrl}, status: ${response.status}`)
        }

        const blob = await response.blob()
        const buffer = await blob.arrayBuffer()
        const uintArray = new Uint8Array(buffer)
        const hex = Array.from(uintArray.slice(0, 4))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('').toUpperCase()
        const ascii = String.fromCharCode.apply(null, uintArray.slice(0, 100))
        const pngMagicNumber = '89504E47'
        const jpegMagicNumber = 'FFD8FF'

        return new Promise((resolve) => {
          if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
            const svgReader = new FileReader()
            svgReader.readAsText(blob)
            svgReader.onloadend = function () {
              const base64 = btoa(unescape(encodeURIComponent(svgReader.result)))
              imgElement.src = 'data:image/svg+xml;base64,' + base64
              resolve()
            }
          } else if (hex === pngMagicNumber || hex === jpegMagicNumber) {
            imgElement.src = fileUrl
            imgElement.onload = resolve
          } else {
            throw new Error('Unknown image type')
          }
        })
      } catch (error) {
        Sentry.captureException(error)
        throw error
      }
    }

    try {
      // Wait for image loading

      await fetchImage(logoUrl).catch(async () => {
        await fetchImage(fallbackUrl).catch(() => {
          imgElement.src = defaultLogo
          return new Promise(resolve => imgElement.onload = resolve)
        })
      })

      // Signal that branding is ready only after all assets are loaded

      if (typeof screenly !== 'undefined' && screenly.signalReadyForRendering) {
        screenly.signalReadyForRendering()
      }
    } catch (error) {
      Sentry.captureException(error)
    }
  } catch (error) {
    Sentry.captureException(error)
  }
}
