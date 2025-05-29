/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry */
/* eslint-disable no-unused-vars */

// Initialize Sentry
const sentryDsn = screenly.settings.sentry_dsn
// Initiate Sentry.
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn
  })
} else {
  console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
}

// Utility functions for locale and timezone handling
const getLocale = async () => {
  const { getNearestCity } = OfflineGeocodeCity
  const defaultLocale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language || 'en'

  const overrideLocale = screenly.settings?.override_locale
  if (overrideLocale) {
    if (moment.locales().includes(overrideLocale)) {
      return overrideLocale
    } else {
      console.warn(`Invalid locale: ${overrideLocale}. Using defaults.`)
    }
  }

  // If no override, try to get locale from coordinates
  try {
    const { metadata } = screenly
    const latitude = metadata.coordinates[0]
    const longitude = metadata.coordinates[1]

    const data = await getNearestCity(latitude, longitude)
    const countryCode = data.countryIso2.toUpperCase()

    return clm.getLocaleByAlpha2(countryCode) || defaultLocale
  } catch (error) {
    console.warn('Failed to get locale from coordinates:', error)
    return defaultLocale
  }
}

const getTimezone = async () => {
  const overrideTimezone = screenly.settings?.override_timezone
  if (overrideTimezone) {
    if (moment.tz.names().includes(overrideTimezone)) {
      return overrideTimezone
    } else {
      console.warn(`Invalid timezone: ${overrideTimezone}. Using defaults.`)
    }
  }

  // If no override, try to get timezone from coordinates
  try {
    const { metadata } = screenly
    const latitude = metadata.coordinates[0]
    const longitude = metadata.coordinates[1]

    return tzlookup(latitude, longitude)
  } catch (error) {
    console.warn('Failed to get timezone from coordinates:', error)
    return moment.tz.guess()
  }
}

const getDateTimeFormats = (locale) => {
  const is24HourFormat = moment.localeData(locale).longDateFormat('LT').includes('H')
  return {
    timeFormat: is24HourFormat ? 'HH:mm' : 'hh:mm A',
    dateFormat: 'ddd, MMM D',
    apiDateFormat: 'YYYY-MM-DD',
    is24HourFormat
  }
}

function hrDashboard () {
  return {
    loading: true,
    currentTime: '',
    employees: [],
    employeeMap: {},
    leaves: [],
    birthdays: [],
    anniversaries: [],
    API_BASE_URL: screenly.cors_proxy_url + '/https://www.charliehr.com/api/v1',
    API_TOKEN: screenly.settings.client_id + ':' + screenly.settings.client_secret,
    API_HEADERS: {
      Accept: 'application/json',
      Authorization: `Token token=${this.API_TOKEN}`
    },
    scrollInterval: null,
    hasValidToken: false,
    apiCache: {
      data: {},
      expiration: 5 * 60 * 1000, // 5 minutes in milliseconds
      get: function (key) {
        const item = this.data[key]
        if (!item) return null
        if (Date.now() > item.expiry) {
          delete this.data[key]
          return null
        }
        return item.data
      },
      set: function (key, data) {
        this.data[key] = {
          data,
          expiry: Date.now() + this.expiration
        }
      }
    },

    async init () {
      // Validate API token
      if (!screenly.settings.client_id || !screenly.settings.client_secret) {
        this.showError('Missing API credentials. Please check your configuration.')
        screenly.signalReadyForRendering()
        return
      }

      this.API_TOKEN = screenly.settings.client_id + ':' + screenly.settings.client_secret
      this.API_HEADERS = {
        Accept: 'application/json',
        Authorization: `Token token=${this.API_TOKEN}`
      }
      this.hasValidToken = true

      try {
        // Initialize clock
        await this.updateClock()
        setInterval(() => this.updateClock(), 1000)

        // Load all data
        await this.loadData()

        // Setup UI elements
        this.startAutoScroll()
        await this.setupThemeAndBrand()

        // Signal that everything is ready for rendering
        console.log('=== All Initialization Complete ===')
        screenly.signalReadyForRendering()
      } catch (error) {
        Sentry.captureException(error)
        this.showError('Failed to initialize the application. Please try again later.')
      }
    },

    async setupThemeAndBrand () {
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
      const defaultLogo = 'static/img/screenly.svg'

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
          const ascii = String.fromCharCode.apply(null, uintArray.slice(0, 100))

          // Handle SVG files
          if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
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
            throw new Error('Unsupported image format')
          }
        } catch (error) {
          console.error('Error fetching image:', error)
          throw error
        }
      }

      // Try loading the image with fallback options
      try {
        // Try CORS proxy first
        await fetchImage(corsUrl)
      } catch (error) {
        try {
          // If CORS fails, try direct URL
          await fetchImage(fallbackUrl)
        } catch (fallbackError) {
          // If both fail, use default logo
          imgElement.src = defaultLogo
        }
      }
    },

    showError (message) {
      const main = document.querySelector('.app__main')
      if (main) {
        main.innerHTML = `
          <div class="dashboard-card" style="flex: 1; text-align: center; padding: 2rem;">
            <h2 class="dashboard-card__title" style="color: #dc3545;">Error</h2>
            <p style="color: var(--text-color-secondary); margin-top: 1rem;">${message}</p>
          </div>
        `
      }
      this.loading = false
    },

    startAutoScroll () {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval)
      }

      this.scrollInterval = setInterval(() => {
        const sections = document.querySelectorAll('section ul')
        sections.forEach(section => {
          if (section.scrollHeight > section.clientHeight) {
            if (section.scrollTop + section.clientHeight >= section.scrollHeight) {
              section.scrollTop = 0
            } else {
              section.scrollTop += 1
            }
          }
        })
      }, 50)
    },

    async updateClock () {
      const locale = await getLocale()
      const timezone = await getTimezone()
      const { timeFormat, dateFormat } = getDateTimeFormats(locale)

      const momentObject = moment().tz(timezone)
      if (locale) {
        momentObject.locale(locale)
      }

      const time = momentObject.format(timeFormat)
      const date = momentObject.format(dateFormat)

      this.currentTime = `${time} — ${date}`
    },

    async loadData () {
      if (!this.hasValidToken) {
        return
      }

      try {
        console.log('=== Starting Data Load ===')
        const [employees, leaveRequests] = await Promise.all([
          this.fetchEmployees(),
          this.fetchLeaveRequests()
        ])

        console.log('=== Processing Employees ===')
        console.log('Total Employees:', employees.length)

        // Create employee map for quick lookup with only needed fields
        this.employeeMap = employees.reduce((map, emp) => {
          map[emp.id] = {
            id: emp.id,
            firstName: emp.first_name,
            lastName: emp.last_name,
            birthdate: emp.date_of_birth,
            startDate: emp.start_date,
            avatar: emp.profile_picture,
            displayName: emp.display_name
          }
          return map
        }, {})

        this.employees = employees

        // Process birthdays and anniversaries
        this.birthdays = this.getUpcomingBirthdays(employees)
        this.anniversaries = this.getUpcomingAnniversaries(employees)

        // Process leave requests - only show approved ones for today
        const today = moment().format('YYYY-MM-DD')
        this.leaves = leaveRequests
          .filter(leave =>
            leave.status === 'approved' &&
            leave.start_date <= today &&
            leave.end_date >= today
          )
          .map(leave => {
            const employee = this.employeeMap[leave.team_member]

            if (!employee) {
              console.warn('No matching employee found for leave:', {
                leaveId: leave.id,
                teamMemberId: leave.team_member
              })
            }

            return {
              ...leave,
              employee: employee || {
                firstName: 'Unknown',
                lastName: 'Employee',
                displayName: 'Unknown Employee',
                profile_picture: null
              }
            }
          })

        console.log('=== Data Processing Complete ===')
        console.log('Total Employees:', this.employees.length)
        console.log('Total Birthdays:', this.birthdays.length)
        console.log('Total Anniversaries:', this.anniversaries.length)
        console.log('Total Active Leaves Today:', this.leaves.length)
      } catch (error) {
        Sentry.captureException(error)
        this.showError('Failed to load data. Please try again later.')
      } finally {
        this.loading = false
      }
    },

    async fetchWithCache (endpoint, params = '') {
      const cacheKey = `${endpoint}${params}`
      const cachedData = this.apiCache.get(cacheKey)

      if (cachedData) {
        console.log(`Using cached data for ${endpoint}`)
        return cachedData
      }

      const res = await fetch(`${this.API_BASE_URL}/${endpoint}${params}`, {
        headers: this.API_HEADERS
      })

      if (!res.ok) {
        throw new Error(`${endpoint} API Error: ${res.status}`)
      }

      const response = await res.json()
      if (!response.success) {
        throw new Error(`${endpoint} API returned unsuccessful response`)
      }

      const data = response.data || []
      this.apiCache.set(cacheKey, data)
      return data
    },

    async fetchEmployees () {
      return this.fetchWithCache('team_members')
    },

    async fetchLeaveRequests () {
      const locale = await getLocale()
      const timezone = await getTimezone()
      const { apiDateFormat } = getDateTimeFormats(locale)

      const momentObject = moment().tz(timezone)
      if (locale) {
        momentObject.locale(locale)
      }

      const today = momentObject.format(apiDateFormat)
      return this.fetchWithCache('leave_requests', `?start_date=${today}&end_date=${today}`)
    },

    isUpcoming (dateStr) {
      if (!dateStr) return false

      const today = new Date()
      const date = new Date(dateStr)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth()
      const isTomorrow = date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth()

      return isToday || isTomorrow
    },

    getUpcomingBirthdays (employees) {
      return employees
        .filter(emp => emp.date_of_birth && this.isUpcoming(emp.date_of_birth))
        .map(emp => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          birthdate: emp.date_of_birth,
          avatar: emp.profile_picture,
          displayName: emp.display_name
        }))
    },

    getYearsOfService (startDate) {
      const start = new Date(startDate)
      const today = new Date()
      let years = today.getFullYear() - start.getFullYear()

      if (today.getMonth() < start.getMonth() ||
        (today.getMonth() === start.getMonth() && today.getDate() < start.getDate())) {
        years--
      }

      return years
    },

    formatAnniversaryText (startDate) {
      const years = this.getYearsOfService(startDate)
      const dateText = this.formatUpcomingDate(startDate)
      return `${years} Year${years !== 1 ? 's' : ''} Anniversary (${dateText})`
    },

    getUpcomingAnniversaries (employees) {
      return employees
        .filter(emp => emp.start_date && this.isUpcoming(emp.start_date))
        .map(emp => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          startDate: emp.start_date,
          avatar: emp.profile_picture,
          displayName: emp.display_name,
          yearsOfService: this.getYearsOfService(emp.start_date)
        }))
    },

    formatDate (dateStr) {
      const date = new Date(dateStr)
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    },

    formatUpcomingDate (dateStr) {
      const date = new Date(dateStr)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const currentYear = today.getFullYear()
      date.setFullYear(currentYear)

      if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth()) {
        return 'Today'
      } else if (date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth()) {
        return 'Tomorrow'
      }
      return this.formatDate(dateStr)
    },

    formatLeaveDate (leave) {
      if (!leave.start_date || !leave.end_date) return 'No date'

      const startDate = this.formatDate(leave.start_date)
      const endDate = this.formatDate(leave.end_date)

      if (startDate === endDate) {
        return startDate
      }

      return `${startDate} - ${endDate}`
    },

    isLeaveActiveToday (leave) {
      const today = moment().format('YYYY-MM-DD')
      return leave.end_date >= today
    }
  }
}
