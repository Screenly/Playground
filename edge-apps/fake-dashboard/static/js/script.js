// Utility functions for generating random data
/* global Chart, screenly */

function randomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function formatNumber (num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

function formatDuration (seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

function formatPercentage (value) {
  return value.toFixed(1) + '%'
}

// Generate static page views data for the last 12 months
function generatePageViewsHistory () {
  const months = []
  const currentDate = new Date()

  // Start from 11 months ago
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate)
    date.setMonth(currentDate.getMonth() - i)
    months.push(date.toLocaleString('default', { month: 'short' }))
  }

  // Generate a somewhat realistic trend with some seasonality
  const baseValue = 65000
  const seasonalFactor = 15000
  const randomFactor = 10000

  const data = months.map((month, index) => {
    // Add seasonal variation (higher in middle months)
    const seasonal = Math.sin((index + 6) * (Math.PI / 6)) * seasonalFactor
    // Add random variation
    const random = (Math.random() - 0.5) * randomFactor
    // Add slight upward trend
    const trend = (index / 11) * 20000

    return {
      month,
      views: Math.max(Math.round(baseValue + seasonal + random + trend), 40000)
    }
  })

  return data
}

// Generate static metrics data
function generateStaticMetrics () {
  // Randomize total users between 65k and 85k
  const users = randomInt(65000, 85000)

  // Sessions should be slightly higher than users (1.05-1.15x)
  const sessionMultiplier = 1.05 + (Math.random() * 0.1)
  const sessions = Math.round(users * sessionMultiplier)

  // Bounce rate between 20-30%
  const bounceRate = 20 + (Math.random() * 10)

  // Session duration between 2-3 minutes (in seconds)
  const sessionDuration = randomInt(120, 180)

  // Change percentages with reasonable ranges
  const usersChange = randomInt(15, 35)
  const sessionsChange = randomInt(30, 50)
  const bounceRateChange = -randomInt(15, 30) // Negative is good for bounce rate
  const durationChange = randomInt(5, 15)

  return {
    users,
    sessions,
    bounceRate,
    sessionDuration,
    usersChange,
    sessionsChange,
    bounceRateChange,
    durationChange
  }
}

// Generate random real-time visitors
function generateRealtimeVisitors () {
  const metrics = generateStaticMetrics()
  // Base this on the total users to keep it proportional (1.4-1.8% of total users)
  const basePercentage = 1.4 + (Math.random() * 0.4)
  const baseVisitors = Math.round(metrics.users * (basePercentage / 100))
  const variation = Math.round(baseVisitors * 0.2) // 20% variation
  return baseVisitors + randomInt(-variation, variation)
}

// Store static data
let deviceData = null
let sourceData = null

// Generate random data for devices
function generateDeviceData () {
  if (!deviceData) {
    // Randomize percentages that add up to 100%
    const desktop = randomInt(65, 75)
    const mobile = randomInt(20, 25)
    const tablets = 100 - desktop - mobile

    deviceData = {
      Desktop: desktop,
      Mobile: mobile,
      Tablets: tablets
    }
  }
  return deviceData
}

// Generate random data for sources
function generateSourceData () {
  if (!sourceData) {
    // Randomize percentages that add up to 100%
    const direct = randomInt(45, 50)
    const organic = randomInt(25, 30)
    const social = randomInt(15, 20)
    const referral = 100 - direct - organic - social

    sourceData = {
      Direct: direct,
      Organic: organic,
      Social: social,
      Referral: referral
    }
  }
  return sourceData
}

// Update metrics display
function updateMetrics () {
  const metrics = generateStaticMetrics()

  document.getElementById('usersValue').textContent = formatNumber(metrics.users)
  document.getElementById('sessionsValue').textContent = formatNumber(metrics.sessions)
  document.getElementById('bounceValue').textContent = formatPercentage(metrics.bounceRate)
  document.getElementById('durationValue').textContent = formatDuration(metrics.sessionDuration)

  document.getElementById('usersChange').textContent = `+${metrics.usersChange}%`
  document.getElementById('sessionsChange').textContent = `+${metrics.sessionsChange}%`
  document.getElementById('bounceChange').textContent = `${metrics.bounceRateChange}%`
  document.getElementById('durationChange').textContent = `+${metrics.durationChange}%`
}

// Update real-time visitors
function updateRealtimeVisitors () {
  const visitors = generateRealtimeVisitors()
  document.getElementById('realtimeValue').textContent = visitors.toLocaleString()
}

// Store the static page views data
let pageViewsData = null

// Initialize and update page views chart
function initPageViewsChart () {
  if (!pageViewsData) {
    pageViewsData = generatePageViewsHistory()
  }

  const ctx = document.getElementById('pageViewsChart').getContext('2d')

  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, 'rgba(126, 44, 210, 0.3)')
  gradient.addColorStop(1, 'rgba(126, 44, 210, 0)')

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: pageViewsData.map(d => d.month),
      datasets: [{
        label: 'Page Views',
        data: pageViewsData.map(d => d.views),
        borderColor: '#7E2CD2',
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1f1f1f',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            size: 14,
            weight: '500'
          },
          bodyFont: {
            size: 13
          },
          callbacks: {
            label: function (context) {
              return context.parsed.y.toLocaleString()
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        y: {
          beginAtZero: true,
          border: {
            display: false
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.06)',
            drawTicks: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 8,
            maxTicksLimit: 6,
            callback: function (value) {
              return value.toLocaleString()
            }
          }
        },
        x: {
          border: {
            display: false
          },
          grid: {
            display: true,
            color: 'rgba(255, 255, 255, 0.06)',
            drawTicks: false
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.5)',
            font: {
              size: 12,
              weight: '500'
            },
            padding: 8
          }
        }
      }
    }
  })
}

// Initialize and update device chart
function initDeviceChart () {
  const ctx = document.getElementById('deviceChart').getContext('2d')
  const data = generateDeviceData()

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: ['#7E2CD2', '#22C55E', '#EF4444'],
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255, 255, 255, 0.7)',
            padding: 20,
            font: {
              size: 13,
              weight: '500'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#1f1f1f',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          titleFont: {
            size: 14,
            weight: '500'
          },
          bodyFont: {
            size: 13
          }
        }
      }
    }
  })
}

// Update sources display
function updateSources () {
  const sources = generateSourceData()
  const container = document.getElementById('sourcesContainer')
  container.innerHTML = ''

  Object.entries(sources).forEach(([source, percentage]) => {
    container.innerHTML += `
            <div class="source-item">
                <span>${source}</span>
                <span>${percentage}%</span>
            </div>
        `
  })
}

// Initialize all charts and start updates
let pageViewsChart, deviceChart

function initCharts () {
  pageViewsChart = initPageViewsChart()
  deviceChart = initDeviceChart()
}

function updateCharts () {
  const deviceData = generateDeviceData()
  deviceChart.data.datasets[0].data = Object.values(deviceData)
  deviceChart.update()
}

// Initialize everything
function init () {
  initCharts()
  updateMetrics()
  updateSources()
  updateRealtimeVisitors()

  // Signal that the app is ready for rendering
  screenly.signalReadyForRendering()

  // Refresh all metrics every 30 seconds
  setInterval(() => {
    deviceData = null // Reset device data
    sourceData = null // Reset source data
    updateMetrics()
    updateSources()
    updateCharts()
  }, 30000)

  // Update real-time visitors more frequently
  setInterval(updateRealtimeVisitors, 5000)
}

// Add resize handler for responsive charts
let resizeTimeout
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    if (pageViewsChart) pageViewsChart.destroy()
    if (deviceChart) deviceChart.destroy()
    initCharts()
  }, 250)
})

// Start when the page loads
window.addEventListener('load', init)
