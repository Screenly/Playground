/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry */
/* eslint-disable-next-line no-unused-vars, no-useless-catch */

document.addEventListener('DOMContentLoaded', async () => {
  const { getNearestCity } = OfflineGeocodeCity
  const allTimezones = moment.tz.names()

  //test Screenly variable

  const screenly = {
    metadata: {
      coordinates: [11.27985,76.2363243], // Example coordinates (San Francisco)
     //coordinates: [50.1210954,8.4717603],
    },
    settings: {
      screenly_color_accent: '#972eff', // Example accent color
      screenly_color_light: '#adafbe', // Example light color
      screenly_logo_dark: 'https://example.com/logo.png', // Example logo URL
      sentry_dsn: null, // Example for Sentry DSN (not initialized)
      override_locale: 'en', // Example locale override
      override_timezone: 'Asia/Kolkata' // Example timezone override
     //override_timezone: 'Europe/Berlin'
    },
    cors_proxy_url: 'https://cors-proxy.example.com', // Example CORS proxy URL
    signalReadyForRendering: () => {
      console.log('Screenly is ready for rendering.');
    }
  };




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
      //throw new Error(`Failed to fetch image from ${fileUrl}, status: ${response.status}`)
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
    console.warn('Error fetching image:', error)
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


/////// RSS Reader

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
      limit: 2,
      rssUrl: 'https://api.codetabs.com/v1/proxy/?quest=http://feeds.bbci.co.uk/news/rss.xml',
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
      this.settings.cacheInterval = parseInt(settings?.cache_interval) ||
        this.settings.cacheInterval
      this.settings.limit = parseInt(settings?.limit) ||
        this.settings.limit
      this.settings.rssUrl = settings?.rss_url || this.settings.rssUrl
      this.settings.rssTitle = settings?.rss_title || this.settings.rssTitle
      this.corsProxy = screenly.cors_proxy_url

      console.log(`CORS Proxy URL: ${this.corsProxy}`)
    },
    init: async function () {
      this.loadSettings()
      const msPerSecond = 1000
      const appCache = new AppCache({
        keyName: 'rssStore'
      })

      setInterval(await (async () => {
        const lambda = async () => {
          try {
            const response = (await getApiResponse(this)).slice(0, this.settings.limit)
            console.log(response)
            this.fetchError = false
            appCache.clear()
            const entries = response.map(
              ({ title, pubDate, content, contentSnippet }) => {
                return { title, pubDate, content, contentSnippet }
              }
            )

            this.entries = entries

            entries.forEach(async (entry) => {
              appCache.add(entry)
            })

            this.isLoading = false
          } catch (err) {
            console.error(err)
            const entries = appCache.getAll()
            if (entries.length === 0) {
              this.fetchError = true
            } else {
              this.fetchError = false
              this.entries = entries
              this.isLoading = false
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

