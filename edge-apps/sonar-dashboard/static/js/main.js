/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup, Sentry, Alpine, RSSParser */
/* eslint-disable no-unused-vars, no-useless-catch */

const screenly = {
  settings: {
    override_locale: 'en',
    override_timezone: 'Asia/Kolkata',
    api_base_ip: '192.168.0.101',  // User configurable - Raspberry Pi IP address
    api_port: '8000',              // API port (usually 8000)
  },
  metadata: {
    coordinates: [34.0522, -118.2437]
  },
  // Fallback function if not running in Screenly environment
  signalReadyForRendering: function() {
    console.log('Dashboard ready for rendering')
  }
}

function dashboard () {
  return {
    // ===== TIMEZONE CONFIGURATION =====
    DASHBOARD_TIMEZONE: null, // Will be set dynamically
    detectedLocale: null,

    // Reactive data
    data: null,
    loading: true,
    error: null,
    lastUpdate: '--:--',
    refreshInterval: null,
    dashboardHTML: '<div class="loading">Loading dashboard data</div>',

    // Initialize component
    async init () {
      await this.initializeTimezone()
      this.fetchAllData()
      this.startAutoRefresh()
      this.updateTimestamp()
    },

    // Initialize timezone detection (based on reference code)
    async initializeTimezone () {
      try {
        const { getNearestCity } = OfflineGeocodeCity
        const allTimezones = moment.tz.names()
        const { metadata, settings } = screenly

        // Use coordinates from screenly metadata as default
        const latitude = metadata.coordinates[0]
        const longitude = metadata.coordinates[1]
        const defaultLocale = 'en' // Set default locale to 'en'

        const getLocale = async () => {
          const overrideLocale = settings?.override_locale

          if (overrideLocale) {
            if (moment.locales().includes(overrideLocale)) {
              return overrideLocale
            } else {
              console.warn(`Invalid locale: ${overrideLocale}. Using defaults.`)
            }
          }

          // If no override, detect from metadata coordinates
          try {
            const data = await getNearestCity(latitude, longitude)
            const countryCode = data.countryIso2.toUpperCase()
            return clm.getLocaleByAlpha2(countryCode) || defaultLocale
          } catch (error) {
            return defaultLocale
          }
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

          // If no override, detect timezone from metadata coordinates
          try {
            const timezone = tzlookup(latitude, longitude)
            if (allTimezones.includes(timezone)) {
              return timezone
            } else {
              return 'UTC' // Fallback to UTC
            }
          } catch (error) {
            return 'UTC' // Fallback to UTC
          }
        }

        // Set the detected timezone and locale
        this.DASHBOARD_TIMEZONE = await getTimezone()
        this.detectedLocale = await getLocale()

      } catch (error) {
        // Fallback to hardcoded timezone if detection fails
        this.DASHBOARD_TIMEZONE = 'Asia/Kolkata'
        this.detectedLocale = 'en'
      }
    },

    // Format numbers
    formatNumber (value) {
      if (typeof value !== 'number') return value
      // If it's a whole number, return as integer
      if (value % 1 === 0) return Math.round(value)
      // Otherwise, limit to 2 decimal places
      return parseFloat(value.toFixed(2))
    },

    // Convert timestamp to dashboard timezone using moment.js
    convertToTimezone (timestamp) {
      if (!timestamp || !this.DASHBOARD_TIMEZONE) return null

      try {
        const momentObj = moment(timestamp).tz(this.DASHBOARD_TIMEZONE)
        return momentObj.toISOString()
      } catch (error) {
        // Fallback to regular date conversion
        return new Date(timestamp).toISOString()
      }
    },

    // Process time series data to convert all timestamps
    processTimeSeriesData (timeSeriesData) {
      if (!Array.isArray(timeSeriesData)) return []

      return timeSeriesData.map(point => ({
        ...point,
        timestamp: this.convertToTimezone(point.timestamp),
        original_timestamp: point.timestamp // Keep original for debugging
      }))
    },

    // Update timestamp using moment.js with detected locale
    updateTimestamp () {
      if (!this.DASHBOARD_TIMEZONE) return

      try {
        const momentObj = moment().tz(this.DASHBOARD_TIMEZONE)

        if (this.detectedLocale) {
          momentObj.locale(this.detectedLocale)
        }

        // Check if the locale prefers a 24-hour format
        const is24HourFormat = moment.localeData(this.detectedLocale).longDateFormat('LT').includes('H')

        const timeFormat = is24HourFormat ? 'HH:mm:ss' : 'hh:mm:ss A'
        const timeString = momentObj.format(timeFormat)

        this.lastUpdate = `${timeString} (${this.DASHBOARD_TIMEZONE})`
      } catch (error) {
        // Fallback to basic formatting
        const now = new Date()
        const timeString = now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: this.DASHBOARD_TIMEZONE || 'UTC'
        })
        this.lastUpdate = `${timeString} (${this.DASHBOARD_TIMEZONE || 'UTC'})`
      }
    },

    // Create dashboard HTML (keeping original structure)
    createDashboardHTML (data) {
      let html = ''

      // Current Scan Card (Left side, top)
      if (data.current_scan) {
        html += `
              <div class="dashboard-card current-scan-card">
                <div class="card-header">
                  <div class="card-icon current">📡</div>
                  <div class="card-title">Current Scan</div>
                </div>
                <div class="card-content">
                  <div class="metrics-grid">
                    <div class="metric">
                      <div class="metric-value">${data.current_scan.unique_devices}</div>
                      <div class="metric-label">Total Devices</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${data.current_scan.ios_devices}</div>
                      <div class="metric-label">iOS Devices</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${data.current_scan.other_devices}</div>
                      <div class="metric-label">Other Devices</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${data.current_scan.scan_duration_seconds}s</div>
                      <div class="metric-label">Scan Duration</div>
                    </div>
                  </div>
                  ${data.current_scan.manufacturer_stats ? this.createManufacturerStats(data.current_scan.manufacturer_stats, 'Device Manufacturers') : ''}
                </div>
              </div>
            `
      }

      // Right side cards container
      html += '<div class="right-cards">'

      // Last Hour Card
      if (data.last_hour) {
        html += `
              <div class="dashboard-card right-card">
                <div class="card-header">
                  <div class="card-icon hour">⏰</div>
                  <div class="card-title">Last Hour</div>
                </div>
                <div class="card-content">
                  <div class="metrics-grid">
                    <div class="metric">
                      <div class="metric-value">${this.formatNumber(data.last_hour.average_unique_devices)}</div>
                      <div class="metric-label">Avg Devices</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${this.formatNumber(data.last_hour.peak_unique_devices)}</div>
                      <div class="metric-label">Peak Devices</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${this.formatNumber(data.last_hour.average_ios_devices)}</div>
                      <div class="metric-label">Avg iOS</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${this.formatNumber(data.last_hour.peak_ios_devices)}</div>
                      <div class="metric-label">Peak iOS</div>
                    </div>
                  </div>
                </div>
              </div>
            `
      }

      // Session Stats Card
      if (data.session_stats) {
        html += `
              <div class="dashboard-card right-card">
                <div class="card-header">
                  <div class="card-icon session">👥</div>
                  <div class="card-title">Session Analytics</div>
                </div>
                <div class="card-content">
                  <div class="metrics-grid">
                    <div class="metric">
                      <div class="metric-value">${this.formatNumber(data.session_stats.total_sessions)}</div>
                      <div class="metric-label">Total Sessions</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${this.formatNumber(data.session_stats.active_sessions)}</div>
                      <div class="metric-label">Active Sessions</div>
                    </div>
                    <div class="metric" style="grid-column: 1 / -1;">
                      <div class="metric-value">${this.formatNumber(data.session_stats.average_dwell_time)}s</div>
                      <div class="metric-label">Average Dwell Time</div>
                    </div>
                  </div>
                </div>
              </div>
            `
      }

      html += '</div>' // Close right-cards container

      // Add histogram card
      html += `
            <div class="dashboard-card histogram-card">
              <div class="card-header">
                <div class="card-icon hour">📊</div>
                <div class="card-title">Device Activity Timeline</div>
              </div>
              <div class="card-content">
                <div class="histogram-container">
                  <canvas id="histogramCanvas" class="histogram-canvas"></canvas>
                </div>
              </div>
            </div>
          `

      return html
    },

    // Create manufacturer stats (keeping original structure)
    createManufacturerStats (stats, title) {
      let html = `
            <div class="manufacturer-stats">
              <h4>${title}</h4>
              <div class="manufacturer-list">
          `

      const sortedStats = Object.entries(stats)
        .sort(([, a], [, b]) => (typeof a === 'number' && typeof b === 'number') ? b - a : 0)
        .slice(0, 12) // Show more manufacturers in the larger left panel

      for (const [manufacturer, count] of sortedStats) {
        const displayValue = typeof count === 'number' ? (count % 1 === 0 ? count : count.toFixed(1)) : count
        html += `
              <div class="manufacturer-item">
                <span class="manufacturer-name">${manufacturer}</span>
                <span class="manufacturer-count">${displayValue}</span>
              </div>
            `
      }

      html += '</div></div>'
      return html
    },

    // Fetch all data
    async fetchAllData () {
      try {
        this.loading = true
        this.error = null

        // Check if we're running in proxy mode (server.js proxy)
        let apiBaseUrl = ''
        let useProxy = false

        try {
          const configResponse = await fetch('/config')
          if (configResponse.ok) {
            const config = await configResponse.json()
            if (config.proxy_mode) {
              // We're running through the proxy server, use local endpoints
              apiBaseUrl = ''  // Empty string means relative to current host
              useProxy = true
            }
          }
        } catch (configError) {
          // Config endpoint not available, we're in direct mode
        }

        if (!useProxy) {
          // Direct mode - construct API URL from settings
          const { settings } = screenly
          apiBaseUrl = `http://${settings.api_base_ip}:${settings.api_port}`
        }

        // Fetch both latest and time series data
        const [latestResponse, timeSeriesResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/api/latest`),
          fetch(`${apiBaseUrl}/api/time-series`)
        ])

        if (!latestResponse.ok) throw new Error(`HTTP ${latestResponse.status} on latest`)

        const latestData = await latestResponse.json()

        // Handle time series data - it might not be available
        let timeSeriesData = []
        if (timeSeriesResponse.ok) {
          const timeSeriesJson = await timeSeriesResponse.json()

          // Extract the time_series array from the response
          timeSeriesData = timeSeriesJson.time_series || timeSeriesJson || []
        } else {
          // Try fallback endpoint
          try {
            const fallbackResponse = await fetch(`${apiBaseUrl}/time-series`)
            if (fallbackResponse.ok) {
              const fallbackJson = await fallbackResponse.json()
              timeSeriesData = fallbackJson.time_series || fallbackJson || []
            }
          } catch (fallbackError) {
            // Fallback failed, continue with empty array
          }
        }

        this.data = {
          ...latestData,
          time_series: this.processTimeSeriesData(timeSeriesData)
        }

        // Add current scan data to time series for real-time display
        if (this.data.current_scan && this.data.time_series) {
          // Create a current timestamp entry from the current scan
          const currentTimestamp = new Date().toISOString()
          const currentEntry = {
            timestamp: this.convertToTimezone(currentTimestamp), // Convert current time to dashboard timezone
            original_timestamp: currentTimestamp,
            average_unique_devices: this.data.current_scan.unique_devices,
            peak_unique_devices: this.data.current_scan.unique_devices,
            average_ios_devices: this.data.current_scan.ios_devices,
            peak_ios_devices: this.data.current_scan.ios_devices,
            scan_count: 1,
            is_current: true // Flag to identify current data
          }

          // Add current data to the end of time series
          this.data.time_series = [...this.data.time_series, currentEntry]
        }

        // Update dashboard HTML
        this.dashboardHTML = this.createDashboardHTML(this.data)

        // Draw histogram after DOM is updated
        this.$nextTick(() => {
          setTimeout(() => {
            this.drawHistogram()
          }, 100)
        })

        this.updateTimestamp()
        this.loading = false

        // Signal ready for rendering
        screenly.signalReadyForRendering()
      } catch (error) {
        // Determine which mode we were trying to use for error message
        let endpointsMessage = ''
        try {
          const configResponse = await fetch('/config')
          if (configResponse.ok) {
            const config = await configResponse.json()
            if (config.proxy_mode) {
              endpointsMessage = 'Proxy endpoints: /api/latest, /api/time-series, /time-series'
            }
          }
        } catch (configError) {
          const { settings } = screenly
          const apiBaseUrl = `http://${settings.api_base_ip}:${settings.api_port}`
          endpointsMessage = `Direct endpoints: ${apiBaseUrl}/api/latest, ${apiBaseUrl}/api/time-series, ${apiBaseUrl}/time-series`
        }

        this.dashboardHTML = `
              <div class="dashboard-card" style="grid-column: 1 / -1; grid-row: 1 / -1;">
                <div class="error">
                  Error loading dashboard data: ${error.message}
                  <br><br>
                  Please check your connection and ensure the API server is running.
                  <br><br>
                  ${endpointsMessage}
                  <br><br>
                  Check browser console for detailed error information.
                </div>
              </div>
            `
        this.loading = false
      }
    },

    // Draw histogram
    drawHistogram () {
      const canvas = document.getElementById('histogramCanvas')
      if (!canvas || !this.data?.time_series || !Array.isArray(this.data.time_series)) {
        return
      }

      const data = this.data.time_series
      const ctx = canvas.getContext('2d')
      const rect = canvas.getBoundingClientRect()

      // Set canvas size to match container
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      const width = rect.width
      const height = rect.height

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Filter data for the last 24 hours based on actual timestamps
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000))

      const last24Hours = data.filter(point => {
        if (!point.timestamp) return false
        const pointTime = new Date(point.timestamp)
        return pointTime >= twentyFourHoursAgo
      }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

      if (last24Hours.length === 0) return

      // Calculate margins
      const margin = { top: 20, right: 30, bottom: 60, left: 50 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom

      // Find max value for scaling - use average_unique_devices
      const maxDevices = Math.max(...last24Hours.map(d => d.average_unique_devices || 0))
      const yScale = chartHeight / (maxDevices || 1)
      const barWidth = chartWidth / last24Hours.length

      // Set styles
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)'
      ctx.strokeStyle = 'rgba(59, 130, 246, 1)'
      ctx.lineWidth = 1

      // Draw bars
      last24Hours.forEach((point, index) => {
        const devices = point.average_unique_devices || 0
        const barHeight = devices * yScale
        const x = margin.left + index * barWidth
        const y = margin.top + chartHeight - barHeight

        // Use different color for current data point
        if (point.is_current) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.8)' // Green for current
          ctx.strokeStyle = 'rgba(16, 185, 129, 1)'
        } else {
          ctx.fillStyle = 'rgba(59, 130, 246, 0.7)' // Blue for historical
          ctx.strokeStyle = 'rgba(59, 130, 246, 1)'
        }

        // Draw bar
        ctx.fillRect(x + 1, y, barWidth - 2, barHeight)
        ctx.strokeRect(x + 1, y, barWidth - 2, barHeight)
      })

      // Draw axes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.lineWidth = 1

      // Y-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, margin.top + chartHeight)
      ctx.stroke()

      // X-axis
      ctx.beginPath()
      ctx.moveTo(margin.left, margin.top + chartHeight)
      ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight)
      ctx.stroke()

      // Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '12px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'

      // Y-axis labels
      const yTicks = 5
      for (let i = 0; i <= yTicks; i++) {
        const value = Math.round((maxDevices * i) / yTicks * 10) / 10
        const y = margin.top + chartHeight - (i * chartHeight / yTicks)

        ctx.textAlign = 'right'
        ctx.fillText(value.toString(), margin.left - 10, y + 4)

        // Grid lines
        if (i > 0) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
          ctx.beginPath()
          ctx.moveTo(margin.left, y)
          ctx.lineTo(margin.left + chartWidth, y)
          ctx.stroke()
        }
      }

      // X-axis labels
      ctx.textAlign = 'center'
      ctx.font = '10px Inter, system-ui, sans-serif'

      // Show labels every 3 hours to avoid crowding, but always show the last (current) point
      last24Hours.forEach((point, index) => {
        const isLast = index === last24Hours.length - 1
        const shouldShowLabel = index % 3 === 0 || isLast // Show every 3rd hour + current time

        if (shouldShowLabel && point.timestamp) {
          const date = new Date(point.timestamp)

          const timeLabel = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            timeZone: this.DASHBOARD_TIMEZONE
          })
          const dateLabel = date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            timeZone: this.DASHBOARD_TIMEZONE
          })

          const x = margin.left + index * barWidth + barWidth / 2

          // Use different color for current time
          if (point.is_current) {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.9)' // Green for current time
          } else {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)' // White for historical
          }

          // Show time on first line
          ctx.fillText(timeLabel, x, margin.top + chartHeight + 15)
          // Show date on second line
          ctx.fillText(dateLabel, x, margin.top + chartHeight + 30)

          // Add "NOW" label for current data
          if (point.is_current) {
            ctx.font = 'bold 9px Inter, system-ui, sans-serif'
            ctx.fillText('NOW', x, margin.top + chartHeight + 45)
            ctx.font = '10px Inter, system-ui, sans-serif' // Reset font
          }
        }
      })
    },

    // Start auto-refresh
    startAutoRefresh () {
      this.refreshInterval = setInterval(() => {
        this.fetchAllData()
      }, 30000) // 30 seconds

      // Handle window resize for histogram
      window.addEventListener('resize', () => {
        setTimeout(() => {
          this.drawHistogram()
        }, 100)
      })
    },

    // Cleanup on component destroy
    destroy () {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
      }
    }
  }
}
