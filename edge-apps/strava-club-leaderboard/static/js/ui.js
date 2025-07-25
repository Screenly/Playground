/* eslint-disable no-unused-vars, no-useless-catch */

/* global StravaUtils */

// UI functions for Strava Club Leaderboard App
window.StravaUI = (function () {
  'use strict'

  // State management functions
  function showLoading () {
    const loadingEl = document.getElementById('loading')
    const errorEl = document.getElementById('error')
    const leaderboardEl = document.getElementById('leaderboard')

    if (loadingEl) loadingEl.style.display = 'flex'
    if (errorEl) errorEl.style.display = 'none'
    if (leaderboardEl) leaderboardEl.style.display = 'none'
  }

  function showError (message) {
    const loadingEl = document.getElementById('loading')
    const errorEl = document.getElementById('error')
    const leaderboardEl = document.getElementById('leaderboard')
    const errorMessageEl = document.getElementById('error-message')

    if (loadingEl) loadingEl.style.display = 'none'
    if (errorEl) errorEl.style.display = 'flex'
    if (leaderboardEl) leaderboardEl.style.display = 'none'
    if (errorMessageEl) errorMessageEl.textContent = message
  }

  function showLeaderboard () {
    const loadingEl = document.getElementById('loading')
    const errorEl = document.getElementById('error')
    const leaderboardEl = document.getElementById('leaderboard')

    if (loadingEl) loadingEl.style.display = 'none'
    if (errorEl) errorEl.style.display = 'none'
    if (leaderboardEl) leaderboardEl.style.display = 'flex'
  }

  // Update club logo and title
  function updateClubLogo (clubData) {
    const logoImage = document.querySelector('.logo-image')
    const logoText = document.querySelector('.logo-text')

    if (clubData && logoImage) {
      // Use club profile picture (60x60 pixels)
      const clubLogoUrl = clubData.profile_medium || clubData.profile

      if (clubLogoUrl) {
        // Add error handler to fall back to default logo if club logo fails to load
        logoImage.onerror = function () {
          logoImage.src = 'static/images/strava.svg'
          logoImage.alt = 'Strava'
          logoImage.onerror = null // Remove error handler
        }

        logoImage.src = clubLogoUrl
        logoImage.alt = clubData.name || 'Club Logo'

        // Update title to include club name
        if (logoText && clubData.name) {
          logoText.textContent = `${clubData.name} Leaderboard`
        }
      }
    }
  }

  // Update last updated time
  function updateLastUpdated () {
    const lastUpdatedEl = document.getElementById('last-updated')
    if (lastUpdatedEl) {
      const textEl = lastUpdatedEl.querySelector('.last-updated-text')
      if (textEl) {
        const now = new Date()
        const locale = StravaUtils.getUserLocale()
        const updatedText = StravaUtils.getLocalizedText('updated', locale)
        textEl.textContent = `${updatedText}: ${now.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit'
        })}`
      }
    }
  }

  // Update statistics display
  function updateStats (activities, leaderboard) {
    const totalActivitiesEl = document.getElementById('total-activities')
    const totalDistanceEl = document.getElementById('total-distance')

    if (totalActivitiesEl) {
      const locale = StravaUtils.getUserLocale()
      const formatter = new Intl.NumberFormat(locale)
      totalActivitiesEl.textContent = formatter.format(activities.length)
    }

    if (totalDistanceEl) {
      const totalDistance = activities.reduce((sum, activity) => sum + (activity.distance || 0), 0)
      totalDistanceEl.textContent = StravaUtils.formatDistance(totalDistance)
    }
  }

  // Update labels for different contexts
  function updateStatsLabels () {
    const statsItems = document.querySelectorAll('#leaderboard-stats .stats-item')

    if (statsItems.length >= 2) {
      const totalActivitiesLabel = statsItems[0].querySelector('.stats-label')
      const totalDistanceLabel = statsItems[1].querySelector('.stats-label')

      // Always show "Recent" labels since time filtering isn't available
      if (totalActivitiesLabel) totalActivitiesLabel.textContent = 'Recent Activities:'
      if (totalDistanceLabel) totalDistanceLabel.textContent = 'Recent Distance:'
    }
  }

  // Update leaderboard title
  function updateLeaderboardTitle () {
    const title = document.getElementById('leaderboard-title')
    if (title) {
      // Always show "Most Active Recent Athletes" since time filtering isn't available
      title.textContent = 'Most Active Recent Athletes'
    }
  }

  // Render the leaderboard
  function renderLeaderboard (leaderboard) {
    const container = document.getElementById('leaderboard-list')
    if (!container) return

    container.innerHTML = ''

    leaderboard.forEach((athlete, index) => {
      const rank = index + 1
      const item = document.createElement('div')
      item.className = `leaderboard-item${rank <= 3 ? ' leaderboard-item-top-3' : ''}`

      const rankBadge = document.createElement('div')
      const rankClass = rank <= 3 ? `leaderboard-rank-${rank}` : 'leaderboard-rank-default'
      rankBadge.className = `leaderboard-rank ${rankClass}`
      rankBadge.textContent = rank

      const athleteInfo = document.createElement('div')
      athleteInfo.className = 'leaderboard-athlete'

      const name = document.createElement('h3')
      name.className = 'leaderboard-name'
      name.textContent = athlete.name

      const activityCount = document.createElement('p')
      activityCount.className = 'leaderboard-activity-count'
      const locale = StravaUtils.getUserLocale()
      const formatter = new Intl.NumberFormat(locale)
      const formattedCount = formatter.format(athlete.activityCount)
      const activityText = athlete.activityCount === 1
        ? StravaUtils.getLocalizedText('activity', locale)
        : StravaUtils.getLocalizedText('activities', locale)
      activityCount.textContent = `${formattedCount} ${activityText}`

      athleteInfo.appendChild(name)
      athleteInfo.appendChild(activityCount)

      const stats = document.createElement('div')
      stats.className = 'leaderboard-stats'

      // Distance stat
      const distanceStat = document.createElement('div')
      distanceStat.className = 'leaderboard-stat'
      distanceStat.innerHTML = `
        <span class="leaderboard-stat-label">Distance</span>
        <span class="leaderboard-stat-value">${StravaUtils.formatDistance(athlete.totalDistance)}</span>
      `

      // Time stat
      const timeStat = document.createElement('div')
      timeStat.className = 'leaderboard-stat'
      timeStat.innerHTML = `
        <span class="leaderboard-stat-label">Time</span>
        <span class="leaderboard-stat-value">${StravaUtils.formatTime(athlete.totalTime)}</span>
      `

      // Elevation stat
      const elevationStat = document.createElement('div')
      elevationStat.className = 'leaderboard-stat'
      elevationStat.innerHTML = `
        <span class="leaderboard-stat-label">Elevation</span>
        <span class="leaderboard-stat-value">${StravaUtils.formatElevation(athlete.totalElevation)}</span>
      `

      // Avg/Activity stat
      const avgStat = document.createElement('div')
      avgStat.className = 'leaderboard-stat'
      const avgDistance = athlete.activityCount > 0 ? athlete.totalDistance / athlete.activityCount : 0
      avgStat.innerHTML = `
        <span class="leaderboard-stat-label">Avg/Activity</span>
        <span class="leaderboard-stat-value">${StravaUtils.formatDistance(avgDistance)}</span>
      `

      stats.appendChild(distanceStat)
      stats.appendChild(timeStat)
      stats.appendChild(elevationStat)
      stats.appendChild(avgStat)

      item.appendChild(rankBadge)
      item.appendChild(athleteInfo)
      item.appendChild(stats)

      container.appendChild(item)
    })
  }

  // Initialize default UI elements
  function initializeUI () {
    // Initialize with default logo and text
    const logoImage = document.querySelector('.logo-image')
    const logoText = document.querySelector('.logo-text')
    if (logoImage) {
      logoImage.src = 'static/images/strava.svg'
      logoImage.alt = 'Strava'
    }
    if (logoText) {
      logoText.textContent = 'Club Leaderboard'
    }

    // Update UI elements
    updateStatsLabels()
    updateLeaderboardTitle()
  }

  // Reset time filtering state
  function resetTimeFilteringState () {
    // Time filtering is never available due to API limitations

    // Remove any existing warning messages
    const existingWarning = document.querySelector('.alert-warning')
    if (existingWarning) {
      existingWarning.remove()
    }
  }

  // Auto-scroll functionality removed - content now limited to top 10 athletes to fit screen

  // Public API
  return {
    showLoading,
    showError,
    showLeaderboard,
    updateClubLogo,
    updateLastUpdated,
    updateStats,
    updateStatsLabels,
    updateLeaderboardTitle,
    renderLeaderboard,
    initializeUI,
    resetTimeFilteringState
  }
})()
