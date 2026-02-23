/* global Chart, screenly */

// ── Website Traffic Dashboard ────────────────────────────────────────────────
let WebsiteTraffic = (function () {
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  function formatDuration(seconds) {
    let minutes = Math.floor(seconds / 60)
    let remainingSeconds = seconds % 60
    return minutes + 'm ' + remainingSeconds + 's'
  }

  function formatPercentage(value) {
    return value.toFixed(1) + '%'
  }

  function generatePageViewsHistory() {
    let months = []
    let currentDate = new Date()

    for (let i = 11; i >= 0; i--) {
      let date = new Date(currentDate)
      date.setMonth(currentDate.getMonth() - i)
      months.push(date.toLocaleString('default', { month: 'short' }))
    }

    let baseValue = 65000
    let seasonalFactor = 15000
    let randomFactor = 10000

    let data = months.map(function (month, index) {
      let seasonal = Math.sin((index + 6) * (Math.PI / 6)) * seasonalFactor
      let random = (Math.random() - 0.5) * randomFactor
      let trend = (index / 11) * 20000

      return {
        month: month,
        views: Math.max(
          Math.round(baseValue + seasonal + random + trend),
          40000,
        ),
      }
    })

    return data
  }

  function generateStaticMetrics() {
    let users = randomInt(65000, 85000)
    let sessionMultiplier = 1.05 + Math.random() * 0.1
    let sessions = Math.round(users * sessionMultiplier)
    let bounceRate = 20 + Math.random() * 10
    let sessionDuration = randomInt(120, 180)
    let usersChange = randomInt(15, 35)
    let sessionsChange = randomInt(30, 50)
    let bounceRateChange = -randomInt(15, 30)
    let durationChange = randomInt(5, 15)

    return {
      users: users,
      sessions: sessions,
      bounceRate: bounceRate,
      sessionDuration: sessionDuration,
      usersChange: usersChange,
      sessionsChange: sessionsChange,
      bounceRateChange: bounceRateChange,
      durationChange: durationChange,
    }
  }

  function generateRealtimeVisitors() {
    let metrics = generateStaticMetrics()
    let basePercentage = 1.4 + Math.random() * 0.4
    let baseVisitors = Math.round(metrics.users * (basePercentage / 100))
    let variation = Math.round(baseVisitors * 0.2)
    return baseVisitors + randomInt(-variation, variation)
  }

  let deviceData = null
  let sourceData = null

  function generateDeviceData() {
    if (!deviceData) {
      let desktop = randomInt(65, 75)
      let mobile = randomInt(20, 25)
      let tablets = 100 - desktop - mobile

      deviceData = {
        Desktop: desktop,
        Mobile: mobile,
        Tablets: tablets,
      }
    }
    return deviceData
  }

  function generateSourceData() {
    if (!sourceData) {
      let direct = randomInt(45, 50)
      let organic = randomInt(25, 30)
      let social = randomInt(15, 20)
      let referral = 100 - direct - organic - social

      sourceData = {
        Direct: direct,
        Organic: organic,
        Social: social,
        Referral: referral,
      }
    }
    return sourceData
  }

  function updateMetrics() {
    let metrics = generateStaticMetrics()

    document.getElementById('usersValue').textContent = formatNumber(
      metrics.users,
    )
    document.getElementById('sessionsValue').textContent = formatNumber(
      metrics.sessions,
    )
    document.getElementById('bounceValue').textContent = formatPercentage(
      metrics.bounceRate,
    )
    document.getElementById('durationValue').textContent = formatDuration(
      metrics.sessionDuration,
    )

    document.getElementById('usersChange').textContent =
      '+' + metrics.usersChange + '%'
    document.getElementById('sessionsChange').textContent =
      '+' + metrics.sessionsChange + '%'
    document.getElementById('bounceChange').textContent =
      metrics.bounceRateChange + '%'
    document.getElementById('durationChange').textContent =
      '+' + metrics.durationChange + '%'
  }

  function updateRealtimeVisitors() {
    let visitors = generateRealtimeVisitors()
    document.getElementById('realtimeValue').textContent =
      visitors.toLocaleString()
  }

  let pageViewsData = null
  let pageViewsChart, deviceChart

  function initPageViewsChart() {
    if (!pageViewsData) {
      pageViewsData = generatePageViewsHistory()
    }

    let ctx = document.getElementById('pageViewsChart').getContext('2d')

    let gradient = ctx.createLinearGradient(0, 0, 0, 400)
    gradient.addColorStop(0, 'rgba(126, 44, 210, 0.3)')
    gradient.addColorStop(1, 'rgba(126, 44, 210, 0)')

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: pageViewsData.map(function (d) {
          return d.month
        }),
        datasets: [
          {
            label: 'Page Views',
            data: pageViewsData.map(function (d) {
              return d.views
            }),
            borderColor: '#7E2CD2',
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1f1f1f',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function (context) {
                return context.parsed.y.toLocaleString()
              },
            },
          },
        },
        interaction: { intersect: false, mode: 'index' },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(255, 255, 255, 0.06)', drawTicks: false },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { size: 12, weight: '500' },
              padding: 8,
              maxTicksLimit: 6,
              callback: function (value) {
                return value.toLocaleString()
              },
            },
          },
          x: {
            border: { display: false },
            grid: {
              display: true,
              color: 'rgba(255, 255, 255, 0.06)',
              drawTicks: false,
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { size: 12, weight: '500' },
              padding: 8,
            },
          },
        },
      },
    })
  }

  function initDeviceChart() {
    let ctx = document.getElementById('deviceChart').getContext('2d')
    let data = generateDeviceData()

    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            data: Object.values(data),
            backgroundColor: ['#7E2CD2', '#22C55E', '#EF4444'],
            borderWidth: 0,
            borderRadius: 4,
          },
        ],
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
              font: { size: 13, weight: '500' },
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: '#1f1f1f',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 12,
          },
        },
      },
    })
  }

  function updateSources() {
    let sources = generateSourceData()
    let container = document.getElementById('sourcesContainer')
    container.innerHTML = ''

    Object.entries(sources).forEach(function (entry) {
      container.innerHTML +=
        '<div class="source-item"><span>' +
        entry[0] +
        '</span><span>' +
        entry[1] +
        '%</span></div>'
    })
  }

  function initCharts() {
    pageViewsChart = initPageViewsChart()
    deviceChart = initDeviceChart()
  }

  function updateCharts() {
    let data = generateDeviceData()
    deviceChart.data.datasets[0].data = Object.values(data)
    deviceChart.update()
  }

  function init() {
    initCharts()
    updateMetrics()
    updateSources()
    updateRealtimeVisitors()

    setInterval(function () {
      deviceData = null
      sourceData = null
      updateMetrics()
      updateSources()
      updateCharts()
    }, 30000)

    setInterval(updateRealtimeVisitors, 5000)

    let resizeTimeout
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(function () {
        if (pageViewsChart) pageViewsChart.destroy()
        if (deviceChart) deviceChart.destroy()
        initCharts()
      }, 250)
    })
  }

  return { init: init }
})()

// ── Health & Safety Dashboard ────────────────────────────────────────────────
let HealthSafety = (function () {
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function randomFloat(min, max, decimals) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
  }

  function pickRandom(arr) {
    return arr[randomInt(0, arr.length - 1)]
  }

  function updateClock() {
    let now = new Date()
    document.getElementById('hs-headerDate').textContent =
      now.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    document.getElementById('hs-headerTime').textContent =
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
  }

  function generateKPIs() {
    return {
      daysWithout: randomInt(85, 200),
      hazards: randomInt(3, 12),
      nearMiss: randomInt(1, 8),
      ppe: randomFloat(93, 99, 0),
      firstAid: randomInt(0, 5),
      safetyScore: randomInt(88, 99),
    }
  }

  function updateKPIs() {
    let kpi = generateKPIs()

    document.getElementById('hs-daysWithout').textContent = kpi.daysWithout
    document.getElementById('hs-kpiHazards').textContent = kpi.hazards
    document.getElementById('hs-kpiNearMiss').textContent = kpi.nearMiss
    document.getElementById('hs-kpiPPE').textContent = kpi.ppe + '%'
    document.getElementById('hs-kpiFirstAid').textContent = kpi.firstAid

    let scoreEl = document.getElementById('safetyScore')
    scoreEl.querySelector('.score-value').textContent = kpi.safetyScore

    let daysAgo = kpi.daysWithout
    let lastDate = new Date()
    lastDate.setDate(lastDate.getDate() - daysAgo)
    document.getElementById('hs-lastIncidentDate').textContent =
      lastDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })

    let trends = [
      { id: 'hs-kpiHazardsTrend', val: randomInt(-3, 4), up: false },
      { id: 'hs-kpiNearMissTrend', val: randomInt(-3, 3), up: false },
      { id: 'hs-kpiPPETrend', val: randomInt(-1, 3), suffix: '%', up: true },
      { id: 'hs-kpiFirstAidTrend', val: randomInt(-2, 2), up: false },
    ]

    trends.forEach(function (t) {
      let el = document.getElementById(t.id)
      let arrow = t.val >= 0 ? '\u25B2' : '\u25BC'
      let isPositive = t.up ? t.val >= 0 : t.val <= 0
      let suffix = t.suffix || ''
      el.textContent = arrow + ' ' + Math.abs(t.val) + suffix
      el.className = 'kpi-trend ' + (isPositive ? 'positive' : 'negative')
    })
  }

  let chartFontSize = Math.max(10, Math.round(window.innerWidth * 0.009))

  let commonTooltip = {
    backgroundColor: '#1c1917',
    titleColor: '#fff',
    bodyColor: '#d6d3d1',
    borderColor: 'rgba(0, 0, 0, 0.15)',
    borderWidth: 1,
    padding: 10,
    cornerRadius: 6,
    titleFont: { size: chartFontSize + 1 },
    bodyFont: { size: chartFontSize },
  }

  let incidentData = null
  let incidentChart = null

  function generateIncidentData() {
    if (!incidentData) {
      let months = []
      let incidents = []
      let nearMisses = []
      let now = new Date()
      for (let i = 11; i >= 0; i--) {
        let d = new Date(now)
        d.setMonth(now.getMonth() - i)
        months.push(d.toLocaleString('default', { month: 'short' }))
        incidents.push(randomInt(0, 5))
        nearMisses.push(randomInt(2, 9))
      }
      incidentData = {
        months: months,
        incidents: incidents,
        nearMisses: nearMisses,
      }
    }
    return incidentData
  }

  function initIncidentChart() {
    let data = generateIncidentData()
    let ctx = document.getElementById('hs-incidentChart').getContext('2d')

    let gradientRed = ctx.createLinearGradient(
      0,
      0,
      0,
      ctx.canvas.clientHeight || 200,
    )
    gradientRed.addColorStop(0, 'rgba(190, 18, 60, 0.25)')
    gradientRed.addColorStop(0.7, 'rgba(190, 18, 60, 0.04)')
    gradientRed.addColorStop(1, 'rgba(190, 18, 60, 0)')

    let gradientAmber = ctx.createLinearGradient(
      0,
      0,
      0,
      ctx.canvas.clientHeight || 200,
    )
    gradientAmber.addColorStop(0, 'rgba(180, 83, 9, 0.15)')
    gradientAmber.addColorStop(0.7, 'rgba(180, 83, 9, 0.02)')
    gradientAmber.addColorStop(1, 'rgba(180, 83, 9, 0)')

    incidentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.months,
        datasets: [
          {
            label: 'Incidents',
            data: data.incidents,
            borderColor: '#be123c',
            backgroundColor: gradientRed,
            tension: 0.4,
            fill: true,
            borderWidth: 2.5,
            pointRadius: 3,
            pointBackgroundColor: '#be123c',
            pointBorderColor: '#fff',
            pointBorderWidth: 1.5,
          },
          {
            label: 'Near Misses',
            data: data.nearMisses,
            borderColor: '#b45309',
            backgroundColor: gradientAmber,
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: chartFontSize,
              boxHeight: 3,
              padding: 12,
              font: { size: chartFontSize },
              color: 'rgba(120, 113, 108, 0.7)',
              usePointStyle: false,
            },
          },
          tooltip: commonTooltip,
        },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.05)', drawTicks: false },
            ticks: {
              font: { size: chartFontSize },
              padding: 6,
              maxTicksLimit: 5,
              stepSize: 2,
            },
          },
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              font: { size: chartFontSize },
              padding: 6,
              maxRotation: 0,
            },
          },
        },
      },
    })
  }

  let zoneHazardData = null
  let zoneHazardChart = null
  let zoneNames = ['Zone A', 'Zone B', 'Zone C', 'Zone D']

  function generateZoneHazardData() {
    if (!zoneHazardData) {
      zoneHazardData = {
        high: zoneNames.map(function () {
          return randomInt(0, 3)
        }),
        medium: zoneNames.map(function () {
          return randomInt(1, 5)
        }),
        low: zoneNames.map(function () {
          return randomInt(2, 6)
        }),
      }
    }
    return zoneHazardData
  }

  function initZoneHazardChart() {
    let data = generateZoneHazardData()
    let ctx = document.getElementById('hs-zoneHazardChart').getContext('2d')

    zoneHazardChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: zoneNames,
        datasets: [
          {
            label: 'High',
            data: data.high,
            backgroundColor: 'rgba(190, 18, 60, 0.75)',
            borderRadius: 3,
          },
          {
            label: 'Medium',
            data: data.medium,
            backgroundColor: 'rgba(180, 83, 9, 0.65)',
            borderRadius: 3,
          },
          {
            label: 'Low',
            data: data.low,
            backgroundColor: 'rgba(13, 148, 136, 0.55)',
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: chartFontSize,
              boxHeight: chartFontSize * 0.6,
              padding: 10,
              font: { size: chartFontSize },
              color: 'rgba(120, 113, 108, 0.7)',
              usePointStyle: true,
              pointStyle: 'rectRounded',
            },
          },
          tooltip: commonTooltip,
        },
        scales: {
          x: {
            stacked: true,
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.05)', drawTicks: false },
            ticks: { font: { size: chartFontSize }, padding: 6, stepSize: 2 },
          },
          y: {
            stacked: true,
            border: { display: false },
            grid: { display: false },
            ticks: { font: { size: chartFontSize, weight: '600' }, padding: 6 },
          },
        },
      },
    })
  }

  let zoneStatuses = [
    { weight: 6, cls: 'safe', label: 'All Clear', detail: 'No active hazards' },
    {
      weight: 3,
      cls: 'caution',
      label: 'Caution',
      detail: 'Active hazard report',
    },
    {
      weight: 1,
      cls: 'danger',
      label: 'Restricted',
      detail: 'Access restricted',
    },
  ]

  function pickZoneStatus() {
    let total = zoneStatuses.reduce(function (s, z) {
      return s + z.weight
    }, 0)
    let rand = Math.random() * total
    let acc = 0
    for (let i = 0; i < zoneStatuses.length; i++) {
      acc += zoneStatuses[i].weight
      if (rand < acc) return zoneStatuses[i]
    }
    return zoneStatuses[0]
  }

  function renderZones() {
    let container = document.getElementById('hs-zoneGrid')
    let html = ''

    zoneNames.forEach(function (name) {
      let status = pickZoneStatus()
      html +=
        '<div class="zone-tile ' +
        status.cls +
        '">' +
        '<span class="zone-light"></span>' +
        '<span class="zone-name">' +
        name +
        '</span>' +
        '<span class="zone-status-text">' +
        status.label +
        '</span>' +
        '<span class="zone-detail">' +
        status.detail +
        '</span>' +
        '</div>'
    })

    container.innerHTML = html
  }

  let alertTemplates = [
    {
      type: 'critical',
      icon: '\uD83D\uDEA8',
      title: 'Gas leak detected Zone C',
      detail: 'Evacuate immediately.',
    },
    {
      type: 'critical',
      icon: '\uD83D\uDEA8',
      title: 'Forklift collision Bay 3',
      detail: 'Area cordoned off.',
    },
    {
      type: 'warning',
      icon: '\u26A0\uFE0F',
      title: 'PPE violation: Zone B dock',
      detail: '3 workers without hard hats.',
    },
    {
      type: 'warning',
      icon: '\u26A0\uFE0F',
      title: 'Fire drill scheduled 14:00',
      detail: 'All to assembly points.',
    },
    {
      type: 'info',
      icon: '\u2139\uFE0F',
      title: 'Safety training: Fri 09:00',
      detail: 'Lockout/tagout refresher.',
    },
    {
      type: 'info',
      icon: '\u2139\uFE0F',
      title: 'First aid kit restocked',
      detail: 'Zone A and D kits updated.',
    },
    {
      type: 'warning',
      icon: '\u26A0\uFE0F',
      title: 'Noise levels above limit',
      detail: 'Zone D exceeding 85 dB.',
    },
    {
      type: 'critical',
      icon: '\uD83D\uDEA8',
      title: 'Emergency shower offline',
      detail: 'Chemical lab repair in progress.',
    },
  ]

  function renderAlerts() {
    let shuffled = alertTemplates.slice().sort(function () {
      return 0.5 - Math.random()
    })
    let alerts = shuffled.slice(0, 5)
    let container = document.getElementById('hs-alertsList')
    let html = ''

    alerts.forEach(function (alert) {
      let minsAgo = randomInt(2, 55)
      html +=
        '<div class="alert-item ' +
        alert.type +
        '">' +
        '<span class="alert-icon">' +
        alert.icon +
        '</span>' +
        '<div class="alert-content">' +
        '<div class="alert-title">' +
        alert.title +
        '</div>' +
        '<div class="alert-time">' +
        minsAgo +
        'm ago &middot; ' +
        alert.detail +
        '</div>' +
        '</div>' +
        '</div>'
    })

    container.innerHTML = html
  }

  let allCharts = []

  function destroyAllCharts() {
    allCharts.forEach(function (c) {
      if (c) c.destroy()
    })
    allCharts = []
  }

  function initAllCharts() {
    Chart.defaults.color = 'rgba(120, 113, 108, 0.8)'
    Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.06)'
    Chart.defaults.font.family =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    initIncidentChart()
    initZoneHazardChart()
    allCharts = [incidentChart, zoneHazardChart]
  }

  function init() {
    updateClock()
    updateKPIs()
    initAllCharts()
    renderZones()
    renderAlerts()

    setInterval(updateClock, 1000)
    setInterval(function () {
      updateKPIs()
      renderZones()
      renderAlerts()
    }, 30000)

    let resizeTimeout
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(function () {
        chartFontSize = Math.max(10, Math.round(window.innerWidth * 0.009))
        destroyAllCharts()
        incidentData = null
        zoneHazardData = null
        initAllCharts()
      }, 250)
    })
  }

  // suppress unused variable warning for pickRandom
  void pickRandom

  return { init: init }
})()

// ── Manufacturing Dashboard ──────────────────────────────────────────────────
let Manufacturing = (function () {
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function randomFloat(min, max, decimals) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
  }

  function updateClock() {
    let now = new Date()
    document.getElementById('mfg-headerDate').textContent =
      now.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    document.getElementById('mfg-headerTime').textContent =
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })

    let hour = now.getHours()
    let shift = 'Shift A'
    if (hour >= 14 && hour < 22) shift = 'Shift B'
    else if (hour >= 22 || hour < 6) shift = 'Shift C'
    document.getElementById('mfg-shiftBadge').textContent = shift
  }

  let DAILY_TARGET = 2400

  function generateKPIs() {
    let output = randomInt(2280, 2420)
    let targetPct = ((output / DAILY_TARGET) * 100).toFixed(1)
    let utilization = randomFloat(85, 94, 1)
    let downtime = randomInt(28, 72)
    let defectRate = randomFloat(0.8, 2.0, 1)
    let otd = randomFloat(93, 99, 1)

    return {
      output: output,
      targetPct: targetPct,
      utilization: utilization,
      downtime: downtime,
      defectRate: defectRate,
      otd: otd,
    }
  }

  function updateKPIs() {
    let kpi = generateKPIs()

    document.getElementById('mfg-kpiOutput').textContent =
      kpi.output.toLocaleString()
    document.getElementById('mfg-kpiTarget').textContent = kpi.targetPct + '%'
    document.getElementById('mfg-kpiUtil').textContent = kpi.utilization + '%'
    document.getElementById('mfg-kpiDowntime').textContent = kpi.downtime
    document.getElementById('mfg-kpiDefect').textContent = kpi.defectRate + '%'
    document.getElementById('mfg-kpiOTD').textContent = kpi.otd + '%'

    let downtimeEl = document.getElementById('mfg-kpiDowntime')
    downtimeEl.className = 'kpi-value'
    if (kpi.downtime > 60) downtimeEl.classList.add('red')
    else if (kpi.downtime > 40) downtimeEl.classList.add('amber')

    let downtimeCard = downtimeEl.closest('.kpi-card')
    if (kpi.downtime > 60) {
      downtimeCard.style.setProperty('--dt-bar', 'var(--kpi-red)')
    } else if (kpi.downtime > 40) {
      downtimeCard.style.setProperty('--dt-bar', 'var(--kpi-amber)')
    } else {
      downtimeCard.style.setProperty('--dt-bar', 'var(--kpi-green)')
    }

    let trends = [
      {
        id: 'mfg-kpiOutputTrend',
        val: randomFloat(-3, 6, 1),
        suffix: '%',
        up: true,
      },
      {
        id: 'mfg-kpiTargetTrend',
        val: randomFloat(-2, 4, 1),
        suffix: '%',
        up: true,
      },
      {
        id: 'mfg-kpiUtilTrend',
        val: randomFloat(-2, 4, 1),
        suffix: '%',
        up: true,
      },
      {
        id: 'mfg-kpiDowntimeTrend',
        val: randomInt(-15, 15),
        suffix: ' min',
        up: false,
      },
      {
        id: 'mfg-kpiDefectTrend',
        val: randomFloat(-0.5, 0.5, 1),
        suffix: '%',
        up: false,
      },
      {
        id: 'mfg-kpiOTDTrend',
        val: randomFloat(-1, 2, 1),
        suffix: '%',
        up: true,
      },
    ]

    trends.forEach(function (t) {
      let el = document.getElementById(t.id)
      let arrow = t.val >= 0 ? '\u25B2' : '\u25BC'
      let isPositive = t.up ? t.val >= 0 : t.val <= 0
      el.textContent = arrow + ' ' + Math.abs(t.val) + t.suffix
      el.className = 'kpi-trend ' + (isPositive ? 'positive' : 'negative')
    })
  }

  let chartFontSize = Math.max(9, Math.round(window.innerWidth * 0.007))

  let commonTooltip = {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    titleColor: '#fff',
    bodyColor: '#fff',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    padding: 8,
    titleFont: { size: chartFontSize },
    bodyFont: { size: chartFontSize },
  }

  let productionData = null
  let productionChart = null

  function generateHourlyData() {
    let hours = []
    let actual = []
    let target = []
    let baseTarget = 100

    for (let h = 6; h <= 22; h++) {
      hours.push(h + ':00')
      target.push(baseTarget)
      let base = randomInt(88, 112)
      if (h >= 12 && h <= 13) base = randomInt(60, 85)
      actual.push(base)
    }
    return { hours: hours, actual: actual, target: target }
  }

  function initProductionChart() {
    if (!productionData) productionData = generateHourlyData()
    let ctx = document.getElementById('mfg-productionChart').getContext('2d')

    let gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      ctx.canvas.clientHeight || 200,
    )
    gradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)')
    gradient.addColorStop(0.6, 'rgba(6, 182, 212, 0.08)')
    gradient.addColorStop(1, 'rgba(6, 182, 212, 0)')

    productionChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: productionData.hours,
        datasets: [
          {
            label: 'Actual',
            data: productionData.actual,
            borderColor: '#06b6d4',
            backgroundColor: gradient,
            tension: 0.35,
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
          },
          {
            label: 'Target',
            data: productionData.target,
            borderColor: 'rgba(245, 158, 11, 0.6)',
            borderDash: [6, 3],
            tension: 0,
            fill: false,
            borderWidth: 1.5,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: chartFontSize,
              boxHeight: 2,
              padding: 10,
              font: { size: chartFontSize },
              color: 'rgba(30, 41, 59, 0.6)',
              usePointStyle: false,
            },
          },
          tooltip: commonTooltip,
        },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.06)', drawTicks: false },
            ticks: {
              font: { size: chartFontSize },
              padding: 4,
              maxTicksLimit: 5,
            },
          },
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              font: { size: chartFontSize },
              padding: 4,
              maxRotation: 0,
            },
          },
        },
      },
    })
  }

  let machineNames = [
    'CNC-01',
    'CNC-02',
    'CNC-03',
    'CNC-04',
    'Press-01',
    'Press-02',
    'Press-03',
    'Press-04',
    'Weld-01',
    'Weld-02',
    'Weld-03',
    'Asm-01',
  ]
  let utilizationValues = null
  let utilizationChart = null

  function generateUtilizationData() {
    if (!utilizationValues) {
      utilizationValues = machineNames.map(function () {
        return randomInt(65, 98)
      })
    }
    return utilizationValues
  }

  function initUtilizationChart() {
    let data = generateUtilizationData()
    let ctx = document.getElementById('mfg-utilizationChart').getContext('2d')

    let colors = data.map(function (v) {
      if (v >= 85) return 'rgba(52, 211, 153, 0.8)'
      if (v >= 70) return 'rgba(251, 191, 36, 0.8)'
      return 'rgba(248, 113, 113, 0.8)'
    })

    utilizationChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: machineNames,
        datasets: [
          {
            label: 'Utilization %',
            data: data,
            backgroundColor: colors,
            borderRadius: 3,
            barPercentage: 0.7,
            categoryPercentage: 0.85,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: commonTooltip },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            border: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.06)', drawTicks: false },
            ticks: {
              font: { size: chartFontSize },
              padding: 4,
              callback: function (v) {
                return v + '%'
              },
            },
          },
          y: {
            border: { display: false },
            grid: { display: false },
            ticks: { font: { size: chartFontSize }, padding: 4 },
          },
        },
      },
    })
  }

  let downtimeData = null
  let downtimeChart = null

  function generateDowntimeData() {
    if (!downtimeData) {
      downtimeData = {
        labels: [
          'Maintenance',
          'Material Shortage',
          'Operator Issue',
          'Power / Technical',
        ],
        values: [
          randomInt(12, 22),
          randomInt(8, 15),
          randomInt(5, 12),
          randomInt(3, 10),
        ],
      }
    }
    return downtimeData
  }

  function initDowntimeChart() {
    let data = generateDowntimeData()
    let ctx = document.getElementById('mfg-downtimeChart').getContext('2d')

    downtimeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [
          {
            data: data.values,
            backgroundColor: [
              'rgba(59, 130, 246, 0.9)',
              'rgba(251, 191, 36, 0.9)',
              'rgba(168, 85, 247, 0.9)',
              'rgba(248, 113, 113, 0.9)',
            ],
            borderWidth: 2,
            borderColor: '#fff',
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: chartFontSize,
              padding: 6,
              font: { size: chartFontSize },
              color: 'rgba(30, 41, 59, 0.7)',
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: Object.assign({}, commonTooltip, {
            callbacks: {
              label: function (ctx) {
                return ' ' + ctx.label + ': ' + ctx.parsed + ' min'
              },
            },
          }),
        },
      },
    })
  }

  let qualityData = null
  let qualityChart = null

  function generateQualityData() {
    if (!qualityData) {
      qualityData = {
        labels: ['Dimensional', 'Surface', 'Assembly', 'Weld', 'Paint'],
        values: [
          randomInt(4, 12),
          randomInt(3, 9),
          randomInt(2, 7),
          randomInt(1, 6),
          randomInt(1, 5),
        ],
      }
    }
    return qualityData
  }

  function initQualityChart() {
    let data = generateQualityData()
    let ctx = document.getElementById('mfg-qualityChart').getContext('2d')

    qualityChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Defects',
            data: data.values,
            backgroundColor: [
              'rgba(248, 113, 113, 0.85)',
              'rgba(251, 191, 36, 0.85)',
              'rgba(168, 85, 247, 0.85)',
              'rgba(59, 130, 246, 0.85)',
              'rgba(6, 182, 212, 0.85)',
            ],
            borderRadius: 3,
            barPercentage: 0.65,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: commonTooltip },
        scales: {
          y: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: 'rgba(0, 0, 0, 0.06)', drawTicks: false },
            ticks: { font: { size: chartFontSize }, padding: 4, stepSize: 2 },
          },
          x: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              font: { size: chartFontSize },
              padding: 4,
              maxRotation: 0,
            },
          },
        },
      },
    })
  }

  let operators = [
    'R. Kumar',
    'S. Patel',
    'J. Torres',
    'M. Chen',
    'A. Novak',
    'D. Williams',
    'K. Tanaka',
    'P. Morales',
    'L. Fischer',
    'B. Singh',
    'H. Park',
    'C. Reeves',
  ]
  let jobPrefixes = ['ORD-4', 'ORD-5', 'ORD-6', 'ORD-7']
  let statuses = [
    { label: 'Running', cls: 'running', weight: 7 },
    { label: 'Idle', cls: 'idle', weight: 2 },
    { label: 'Maintenance', cls: 'maintenance', weight: 1 },
    { label: 'Error', cls: 'error', weight: 0.5 },
  ]

  function pickWeightedStatus() {
    let total = statuses.reduce(function (sum, s) {
      return sum + s.weight
    }, 0)
    let r = Math.random() * total
    let acc = 0
    for (let i = 0; i < statuses.length; i++) {
      acc += statuses[i].weight
      if (r < acc) return statuses[i]
    }
    return statuses[0]
  }

  function generateShopfloor() {
    return machineNames.map(function (machine, i) {
      let status = pickWeightedStatus()
      let eff =
        status.cls === 'running'
          ? randomInt(78, 99)
          : status.cls === 'idle'
            ? randomInt(0, 15)
            : 0
      let job =
        status.cls === 'running' || status.cls === 'idle'
          ? jobPrefixes[randomInt(0, 3)] + randomInt(100, 999)
          : '\u2014'
      let effClass = 'high'
      if (eff < 70) effClass = 'low'
      else if (eff < 85) effClass = 'medium'

      return {
        machine: machine,
        status: status,
        job: job,
        operator: operators[i],
        efficiency: eff,
        effClass: effClass,
      }
    })
  }

  function renderShopfloor() {
    let rows = generateShopfloor()
    let tbody = document.getElementById('mfg-shopfloorBody')
    let html = ''

    rows.forEach(function (row) {
      html +=
        '<tr>' +
        '<td>' +
        row.machine +
        '</td>' +
        '<td><span class="status-badge ' +
        row.status.cls +
        '"><span class="status-dot"></span>' +
        row.status.label +
        '</span></td>' +
        '<td>' +
        row.job +
        '</td>' +
        '<td>' +
        row.operator +
        '</td>' +
        '<td><span class="efficiency-value ' +
        row.effClass +
        '">' +
        row.efficiency +
        '%</span></td>' +
        '</tr>'
    })

    tbody.innerHTML = html
  }

  let alertTemplates = [
    {
      type: 'critical',
      icon: '\u26A0\uFE0F',
      title: 'CNC-03 unplanned downtime',
      detail: 'Spindle overtemp fault detected',
    },
    {
      type: 'critical',
      icon: '\u26A0\uFE0F',
      title: 'Weld-02 safety interlock',
      detail: 'E-stop triggered on Line 3',
    },
    {
      type: 'warning',
      icon: '\u26A0\uFE0F',
      title: 'Defect rate above 1.5%',
      detail: 'Surface defects on Press-02 output',
    },
    {
      type: 'warning',
      icon: '\u26A0\uFE0F',
      title: 'Material low: AL-6061 bar',
      detail: 'Reorder threshold reached',
    },
    {
      type: 'info',
      icon: '\uD83D\uDD27',
      title: 'PM due: Press-04',
      detail: 'Scheduled maintenance in 2 hours',
    },
    {
      type: 'info',
      icon: '\uD83D\uDD27',
      title: 'Tool change: CNC-01',
      detail: 'Insert wear limit at 92%',
    },
    {
      type: 'warning',
      icon: '\u26A0\uFE0F',
      title: 'OEE drop on Line 2',
      detail: 'Below 75% for last hour',
    },
    {
      type: 'critical',
      icon: '\u26A0\uFE0F',
      title: 'Compressed air pressure low',
      detail: 'Main header below 85 PSI',
    },
  ]

  function renderAlerts() {
    let shuffled = alertTemplates.slice().sort(function () {
      return 0.5 - Math.random()
    })
    let alerts = shuffled.slice(0, 5)
    let container = document.getElementById('mfg-alertsList')
    let html = ''

    alerts.forEach(function (alert) {
      let minsAgo = randomInt(2, 45)
      html +=
        '<div class="alert-item ' +
        alert.type +
        '">' +
        '<span class="alert-icon">' +
        alert.icon +
        '</span>' +
        '<div class="alert-content">' +
        '<div class="alert-title">' +
        alert.title +
        '</div>' +
        '<div class="alert-time">' +
        minsAgo +
        'm ago &middot; ' +
        alert.detail +
        '</div>' +
        '</div>' +
        '</div>'
    })

    container.innerHTML = html
  }

  let allCharts = []

  function destroyAllCharts() {
    allCharts.forEach(function (c) {
      if (c) c.destroy()
    })
    allCharts = []
  }

  function initAllCharts() {
    Chart.defaults.color = 'rgba(30, 41, 59, 0.6)'
    Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.06)'
    Chart.defaults.font.family =
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    initProductionChart()
    initUtilizationChart()
    initDowntimeChart()
    initQualityChart()
    allCharts = [productionChart, utilizationChart, downtimeChart, qualityChart]
  }

  function init() {
    updateClock()
    updateKPIs()
    initAllCharts()
    renderShopfloor()
    renderAlerts()

    setInterval(updateClock, 1000)
    setInterval(function () {
      updateKPIs()
      renderShopfloor()
      renderAlerts()
    }, 30000)

    let resizeTimeout
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(function () {
        chartFontSize = Math.max(9, Math.round(window.innerWidth * 0.007))
        destroyAllCharts()
        productionData = null
        utilizationValues = null
        downtimeData = null
        qualityData = null
        initAllCharts()
      }, 250)
    })
  }

  return { init: init }
})()

// ── Production QA Dashboard ──────────────────────────────────────────────────
let ProductionQA = (function () {
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function randomFloat(min, max, dec) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(dec))
  }

  function updateClock() {
    let now = new Date()
    document.getElementById('qa-headerDate').textContent =
      now.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    document.getElementById('qa-headerTime').textContent =
      now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
    let h = now.getHours()
    let shift = 'Shift A'
    if (h >= 14 && h < 22) shift = 'Shift B'
    else if (h >= 22 || h < 6) shift = 'Shift C'
    document.getElementById('qa-shiftBadge').textContent = shift
  }

  let FPY_TARGET = 97.2

  function setCardStatus(id, status) {
    let el = document.getElementById(id)
    el.classList.remove('st-amber', 'st-red')
    if (status === 'red') el.classList.add('st-red')
    else if (status === 'amber') el.classList.add('st-amber')
  }

  function setTrend(id, value, isPositive) {
    let el = document.getElementById(id)
    let arrow = isPositive ? '\u25B2' : '\u25BC'
    el.textContent = arrow + ' ' + value
    el.className = 'kpi-trend ' + (isPositive ? 'positive' : 'negative')
  }

  function updateKPIs() {
    let fpy = randomFloat(95.0, 99.5, 1)
    let defect = randomFloat(1.5, 4.5, 1)
    let scrap = randomFloat(0.5, 2.5, 1)
    let rework = randomFloat(0.3, 1.8, 1)
    let audit = randomInt(82, 99)
    let complaints = randomInt(1, 7)

    document.getElementById('qa-kpiFpy').textContent = fpy.toFixed(1) + '%'
    document.getElementById('qa-kpiDefect').textContent =
      defect.toFixed(1) + '%'
    document.getElementById('qa-kpiScrap').textContent = scrap.toFixed(1) + '%'
    document.getElementById('qa-kpiRework').textContent =
      rework.toFixed(1) + '%'
    document.getElementById('qa-kpiAudit').textContent = audit + '%'
    document.getElementById('qa-kpiComplaints').textContent = complaints

    setCardStatus(
      'qa-cardFpy',
      fpy < 95 ? 'red' : fpy < FPY_TARGET ? 'amber' : '',
    )
    let fpyD = randomFloat(-1.0, 1.5, 1)
    setTrend('qa-trendFpy', Math.abs(fpyD) + '% vs target', fpyD >= 0)

    setCardStatus(
      'qa-cardDefect',
      defect > 4 ? 'red' : defect > 2.8 ? 'amber' : '',
    )
    let defD = randomFloat(-0.8, 0.6, 1)
    setTrend('qa-trendDefect', Math.abs(defD) + '%', defD <= 0)

    setCardStatus(
      'qa-cardScrap',
      scrap > 2.0 ? 'red' : scrap > 1.2 ? 'amber' : '',
    )
    let scrD = randomFloat(-0.5, 0.4, 1)
    setTrend('qa-trendScrap', Math.abs(scrD) + '%', scrD <= 0)

    setCardStatus(
      'qa-cardRework',
      rework > 1.5 ? 'red' : rework > 0.8 ? 'amber' : '',
    )
    let rwD = randomFloat(-0.4, 0.3, 1)
    setTrend('qa-trendRework', Math.abs(rwD) + '%', rwD <= 0)

    setCardStatus(
      'qa-cardAudit',
      audit < 80 ? 'red' : audit < 90 ? 'amber' : '',
    )
    let auD = randomInt(-3, 5)
    setTrend('qa-trendAudit', Math.abs(auD) + ' pts', auD >= 0)

    setCardStatus(
      'qa-cardComplaints',
      complaints >= 6 ? 'red' : complaints >= 4 ? 'amber' : '',
    )
    let coD = randomInt(-3, 2)
    setTrend('qa-trendComplaints', Math.abs(coD) + ' vs last mo', coD <= 0)
  }

  let DEFECT_CATS = [
    { name: 'Dimensional Error', min: 18, max: 35 },
    { name: 'Surface Damage', min: 12, max: 25 },
    { name: 'Assembly Issue', min: 8, max: 18 },
    { name: 'Paint Defect', min: 5, max: 14 },
    { name: 'Weld Porosity', min: 3, max: 10 },
  ]

  let DEFECT_COLORS = [
    'var(--kpi-red)',
    'var(--kpi-amber)',
    'var(--accent-purple)',
    'var(--accent-blue)',
    'var(--accent-cyan)',
  ]

  function renderDefectBreakdown() {
    let cats = DEFECT_CATS.map(function (c) {
      return { name: c.name, pct: randomInt(c.min, c.max) }
    })
    cats.sort(function (a, b) {
      return b.pct - a.pct
    })
    let maxPct = cats[0].pct

    let container = document.getElementById('qa-defectBreakdown')
    let html = ''

    cats.forEach(function (c, i) {
      let barW = Math.round((c.pct / maxPct) * 100)
      html +=
        '<div class="db-row">' +
        '<span class="db-name">' +
        c.name +
        '</span>' +
        '<span class="db-pct">' +
        c.pct +
        '%</span>' +
        '<div class="db-bar-track">' +
        '<div class="db-bar-fill" style="width:' +
        barW +
        '%;background:' +
        DEFECT_COLORS[i] +
        '"></div>' +
        '</div>' +
        '</div>'
    })

    container.innerHTML = html
  }

  function renderThroughput() {
    let perHr = randomInt(82, 108)
    let target = 100
    let totalToday = randomInt(1400, 1950)
    let pct = Math.min(Math.round((perHr / target) * 100), 100)
    let deg = Math.round((pct / 100) * 360)

    let color = 'var(--kpi-green)'
    if (pct < 80) color = 'var(--kpi-red)'
    else if (pct < 90) color = 'var(--kpi-amber)'

    let gradient =
      'conic-gradient(' +
      color +
      ' 0deg ' +
      deg +
      'deg, rgba(0,0,0,0.06) ' +
      deg +
      'deg 360deg)'

    document.getElementById('qa-throughput').innerHTML =
      '<div class="gauge-ring" style="background:' +
      gradient +
      '">' +
      '<div class="gauge-inner">' +
      '<span class="gauge-val">' +
      perHr +
      '</span>' +
      '<span class="gauge-unit">per hr</span>' +
      '</div>' +
      '</div>' +
      '<div class="gauge-info">' +
      '<span class="gauge-info-primary">' +
      totalToday.toLocaleString() +
      '</span>' +
      '<span class="gauge-info-label">Inspected Today</span>' +
      '<span class="gauge-info-sub">Target: ' +
      target +
      '/hr &middot; ' +
      pct +
      '%</span>' +
      '</div>'
  }

  let DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  function renderTrend() {
    let values = []
    for (let i = 0; i < 7; i++) {
      values.push(randomFloat(94.5, 99.5, 1))
    }
    let minV = 93
    let maxV = 100
    let range = maxV - minV

    let html = '<div class="trend-bars">'
    values.forEach(function (v, i) {
      let hPct = Math.max(((v - minV) / range) * 100, 4)
      let color = 'var(--kpi-green)'
      if (v < 95) color = 'var(--kpi-red)'
      else if (v < FPY_TARGET) color = 'var(--kpi-amber)'

      html +=
        '<div class="trend-col">' +
        '<span class="trend-val">' +
        v.toFixed(1) +
        '</span>' +
        '<div class="trend-bar" style="height:' +
        hPct +
        '%;background:' +
        color +
        '"></div>' +
        '<span class="trend-day">' +
        DAYS[i] +
        '</span>' +
        '</div>'
    })
    html += '</div>'

    document.getElementById('qa-trendChart').innerHTML = html
  }

  let LINE_COLORS = [
    'var(--kpi-red)',
    'var(--kpi-amber)',
    'var(--accent-blue)',
    'var(--accent-cyan)',
  ]

  function renderLineDefects() {
    let lines = [
      { name: 'Line A', count: randomInt(8, 18) },
      { name: 'Line B', count: randomInt(4, 14) },
      { name: 'Line C', count: randomInt(2, 10) },
      { name: 'Line D', count: randomInt(1, 8) },
    ]
    lines.sort(function (a, b) {
      return b.count - a.count
    })
    let max = lines[0].count || 1

    let html = ''
    lines.forEach(function (l, i) {
      let pct = Math.round((l.count / max) * 100)
      html +=
        '<div class="ld-row">' +
        '<span class="ld-name">' +
        l.name +
        '</span>' +
        '<div class="ld-bar-track">' +
        '<div class="ld-bar-fill" style="width:' +
        pct +
        '%;background:' +
        LINE_COLORS[i] +
        '"></div>' +
        '</div>' +
        '<span class="ld-count">' +
        l.count +
        '</span>' +
        '</div>'
    })

    document.getElementById('qa-lineDefects').innerHTML = html
  }

  function renderBatchStatus() {
    let total = randomInt(40, 60)
    let fail = randomInt(1, 6)
    let pass = total - fail
    let passPct = ((pass / total) * 100).toFixed(1)
    let passDeg = Math.round((pass / total) * 360)

    let gradient =
      'conic-gradient(var(--kpi-green) 0deg ' +
      passDeg +
      'deg, var(--kpi-red) ' +
      passDeg +
      'deg 360deg)'

    document.getElementById('qa-batchStatus').innerHTML =
      '<div class="gauge-ring" style="background:' +
      gradient +
      '">' +
      '<div class="gauge-inner">' +
      '<span class="gauge-val">' +
      passPct +
      '%</span>' +
      '<span class="gauge-unit">pass rate</span>' +
      '</div>' +
      '</div>' +
      '<div class="bs-info">' +
      '<div class="bs-row"><span class="bs-count pass">' +
      pass +
      '</span><span class="bs-label">Passed</span></div>' +
      '<div class="bs-row"><span class="bs-count fail">' +
      fail +
      '</span><span class="bs-label">Failed</span></div>' +
      '<span class="bs-total">' +
      total +
      ' batches inspected</span>' +
      '</div>'
  }

  function renderCOPQ() {
    let scrapCost = randomFloat(5.0, 12.0, 1)
    let reworkCost = randomFloat(1.5, 5.0, 1)
    let warrantyCost = randomFloat(0.5, 3.0, 1)
    let inspectionCost = randomFloat(1.0, 4.0, 1)
    let total = scrapCost + reworkCost + warrantyCost + inspectionCost
    let max = Math.max(scrapCost, reworkCost, warrantyCost, inspectionCost)

    let items = [
      { label: 'Scrap', val: scrapCost, color: 'var(--kpi-red)' },
      { label: 'Rework', val: reworkCost, color: 'var(--kpi-amber)' },
      { label: 'Warranty', val: warrantyCost, color: 'var(--accent-blue)' },
      {
        label: 'Inspection',
        val: inspectionCost,
        color: 'var(--accent-purple)',
      },
    ]

    let html =
      '<div class="copq-total">' +
      '<span class="copq-total-label">Total COPQ</span>' +
      '<span class="copq-total-val">$' +
      total.toFixed(1) +
      'K</span>' +
      '</div>'

    items.forEach(function (item) {
      let pct = Math.round((item.val / max) * 100)
      html +=
        '<div class="copq-row">' +
        '<span class="copq-label">' +
        item.label +
        '</span>' +
        '<div class="copq-bar-track">' +
        '<div class="copq-bar-fill" style="width:' +
        pct +
        '%;background:' +
        item.color +
        '"></div>' +
        '</div>' +
        '<span class="copq-val">$' +
        item.val.toFixed(1) +
        'K</span>' +
        '</div>'
    })

    document.getElementById('qa-copq').innerHTML = html
  }

  function refreshAll() {
    updateKPIs()
    renderDefectBreakdown()
    renderThroughput()
    renderTrend()
    renderLineDefects()
    renderBatchStatus()
    renderCOPQ()
  }

  function init() {
    updateClock()
    refreshAll()
    setInterval(updateClock, 1000)
    setInterval(refreshAll, 30000)
  }

  return { init: init }
})()

// ── Main Dashboard Switcher ──────────────────────────────────────────────────
window.addEventListener('load', function () {
  let dashboard = (screenly.settings.dashboard || 'website-traffic').trim()

  let viewMap = {
    'website-traffic': 'dash-website',
    'health-safety': 'dash-health-safety',
    'manufacturing-kpi': 'dash-manufacturing',
    'production-qa': 'dash-production-qa',
  }

  let viewId = viewMap[dashboard] || 'dash-website'
  document.getElementById(viewId).classList.add('active')

  switch (dashboard) {
    case 'health-safety':
      HealthSafety.init()
      break
    case 'manufacturing-kpi':
      Manufacturing.init()
      break
    case 'production-qa':
      ProductionQA.init()
      break
    default:
      WebsiteTraffic.init()
  }

  screenly.signalReadyForRendering()
})
