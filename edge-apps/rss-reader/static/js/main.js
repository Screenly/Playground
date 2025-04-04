/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry, Alpine, RSSParser */
/* eslint-disable-next-line no-unused-vars, no-useless-catch */

// Initialize Sentry first to capture errors
const sentryDsn = screenly?.settings?.sentry_dsn
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn
  })
} else {
  console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
}

class AppCache {
  constructor ({ keyName }) {
    this.keyName = keyName

    if (localStorage.getItem(this.keyName) === null) {
      this.data = []
      localStorage.setItem(this.keyName, JSON.stringify(this.data))
    } else {
      this.data = JSON.parse(localStorage.getItem(this.keyName))
      console.log('Database setup complete')
    }
  }

  clear () {
    this.data = []
    localStorage.removeItem(this.keyName)
  }

  add (data) {
    this.data.push(data)
    localStorage.setItem(this.keyName, JSON.stringify(this.data))
  }

  getAll () {
    return this.data
  }
}

const processUrl = (context) => {
  const corsProxy = context.corsProxy
  const { bypassCors, rssUrl } = context.settings

  if (bypassCors) {
    return `${corsProxy}/${rssUrl}`
  } else {
    return rssUrl
  }
}

const getApiResponse = (context) => {
  return new Promise((resolve, reject) => {
    const parser = new RSSParser()
    const url = processUrl(context)
    parser.parseURL(url, (err, feed) => {
      if (err) {
        reject(err)
      }
      resolve(feed.items)
    })
  })
}

const getRssData = function () {
  return {
    entries: [],
    settings: {
      cacheInterval: 1800,
      rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
      rssTitle: 'BBC News'
    },
    isLoading: true,
    fetchError: false,
    loadSettings: function () {
      if (typeof screenly === 'undefined') {
        console.warn('screenly is not defined. Using default settings.')
        return
      }
      const settings = screenly.settings
      this.settings.bypassCors = (settings?.bypass_cors === 'true')
      this.settings.cacheInterval = parseInt(settings?.cache_interval) || this.settings.cacheInterval
      this.settings.rssUrl = settings?.rss_url || this.settings.rssUrl
      this.settings.rssTitle = settings?.rss_title || this.settings.rssTitle
      this.corsProxy = screenly.cors_proxy_url
    },
    init: async function () {
      this.loadSettings()
      const msPerSecond = 1000
      const appCache = new AppCache({ keyName: 'rssStore' })

      setInterval(await (async () => {
        const lambda = async () => {
          try {
            const response = (await getApiResponse(this)).slice(0, 4)
            this.fetchError = false
            appCache.clear()
            const entries = response.map(({ title, pubDate, content }) => {
              // Process HTML content if present
              let processedContent = content || ''
              if (content && content.includes('<')) {
                // Strip HTML tags while preserving text content
                processedContent = content
                  .replace(/<[^>]*>/g, '')
                  .replace(/\s+/g, ' ')
                  .trim()
              }

              return { title, pubDate, content: processedContent }
            })

            this.entries = entries

            // Store pubDates in localStorage with same interval as appCache
            const MAX_ENTRIES = 4
            for (let i = 0; i < MAX_ENTRIES; i++) {
              localStorage.setItem(`pubDate-${i}`, entries[i].pubDate)
            }

            entries.forEach(entry => {
              appCache.add(entry)
            })

            this.isLoading = false

            // Dispatch event to signal RSS data is loaded
            document.dispatchEvent(new Event('rssDataLoaded'))
          } catch (err) {
            console.error(err)
            const entries = appCache.getAll()
            if (entries.length === 0) {
              this.fetchError = true
            } else {
              this.fetchError = false
              this.entries = entries
              this.isLoading = false

              // Dispatch event even when using cached data
              document.dispatchEvent(new Event('rssDataLoaded'))
            }
          }
        }

        lambda()
        return lambda
      })(), this.settings.cacheInterval * msPerSecond)
    }
  }
}

document.addEventListener('alpine:init', () => {
  Alpine.data('rss', getRssData)
})

// Listen for RSS data loaded event before initializing the rest
document.addEventListener('rssDataLoaded', async () => {
  const { getNearestCity } = OfflineGeocodeCity
  const allTimezones = moment.tz.names()

  async function timeAndLocale () {
    const { metadata, settings } = screenly
    const latitude = metadata.coordinates[0]
    const longitude = metadata.coordinates[1]
    const defaultLocale = navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language

    const getLocale = async () => {
      const overrideLocale = settings?.override_locale || 'en'

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
        momentObject.locale(locale)
      }
      const dayOfMonth = momentObject.format('DD')
      document.querySelector('.date-text').innerText = momentObject.format('ddd').toUpperCase()
      document.querySelector('.date-number').innerText = dayOfMonth

      const format = moment.localeData(locale).longDateFormat('LT').includes('A') ? 'ddd MMM DD YYYY hh:mm A' : 'ddd MMM DD YYYY HH:mm'
      const pubDates = ['pubDate-0', 'pubDate-1', 'pubDate-2', 'pubDate-3'].map(dateKey => {
        return moment(localStorage.getItem(dateKey)).tz(timezone).locale(locale).format(format)
      })

      pubDates.forEach((pubDate, index) => {
        document.querySelector(`.content-timestamp-${index}`).innerText = pubDate
      })
    }

    initDateTime()
  }

  await timeAndLocale()

  // constant colors
  const tertiaryColor = '#FFFFFF'
  const backgroundColor = '#C9CDD0'

  // Theme Selection
  const theme = screenly.settings.theme || 'light'

  // Brand details fetching from settings
  const primaryColor = (!screenly.settings.screenly_color_accent || screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff') ? '#972eff' : screenly.settings.screenly_color_accent

  let secondaryColor = '#adafbe'
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

  document.querySelectorAll('.rss-title').forEach(element => {
    element.innerText = screenly.settings.rss_title
  })

  screenly.signalReadyForRendering()
})
