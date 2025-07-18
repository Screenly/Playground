/* global screenly, StravaUtils, StravaCache, StravaAPI, StravaUI */

// Strava Club Leaderboard App - Main Application Logic
(function () {
  'use strict'

  // Configuration
  const CONFIG = {
    REFRESH_INTERVAL: 15 * 60 * 1000, // 15 minutes - Conservative for API rate limits (600 req/15min)
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  }

  // State management
  const appState = {
    isLoading: false,
    hasError: false,
    activities: [],
    leaderboard: [],
    lastUpdate: null,
    refreshTimer: null
    // Note: Time filtering is never available due to Strava Club Activities API limitations
  }

  // Main application logic
  async function loadLeaderboard () {
    if (appState.isLoading) return

    appState.isLoading = true
    appState.hasError = false

    // Reset time filtering state
    StravaUI.resetTimeFilteringState()

    try {
      StravaUI.showLoading()

      // Use real Strava API
      const clubId = screenly.settings.club_id
      if (!clubId) {
        throw new Error('Club ID is required. Please configure your Strava club ID.')
      }

      const accessToken = screenly.settings.access_token
      if (!accessToken) {
        throw new Error('Access token is required. Please configure your Strava access token.')
      }

      // Fetch club details and update logo
      const clubData = await StravaAPI.fetchClubDetails(clubId)

      // Clear cache for this club to force fresh data
      StravaCache.clearCacheForClub(clubId)

      const activities = await StravaAPI.fetchAllClubActivities(clubId)

      // Update club logo
      if (clubData) {
        StravaUI.updateClubLogo(clubData)
      }

      const leaderboard = StravaAPI.processLeaderboard(activities)

      // Update state
      appState.activities = activities
      appState.leaderboard = leaderboard
      appState.lastUpdate = new Date()

      // Update UI
      StravaUI.updateStats(activities, leaderboard)
      StravaUI.renderLeaderboard(leaderboard.slice(0, 10)) // Limit to top 10 to fit screen
      StravaUI.updateLastUpdated()
      StravaUI.updateStatsLabels()
      StravaUI.updateLeaderboardTitle()
      StravaUI.showLeaderboard()

      // Signal ready for rendering after data is loaded and UI is updated
      if (typeof screenly !== 'undefined' && screenly.signalReadyForRendering) {
        screenly.signalReadyForRendering()
      }
    } catch (error) {
      appState.hasError = true
      appState.errorMessage = error.message

      StravaUI.showError(error.message)

      // Signal ready for rendering even in error state
      if (typeof screenly !== 'undefined' && screenly.signalReadyForRendering) {
        screenly.signalReadyForRendering()
      }
    } finally {
      appState.isLoading = false
    }
  }

  // Start automatic refresh timer
  function startRefreshTimer () {
    if (appState.refreshTimer) {
      clearInterval(appState.refreshTimer)
    }

    appState.refreshTimer = setInterval(() => {
      loadLeaderboard()
    }, CONFIG.REFRESH_INTERVAL)
  }

  // Stop refresh timer
  function stopRefreshTimer () {
    if (appState.refreshTimer) {
      clearInterval(appState.refreshTimer)
      appState.refreshTimer = null
    }
  }

  // Initialize application
  async function init () {
    try {
      // Initialize UI with default elements
      StravaUI.initializeUI()

      // Load leaderboard (this will also fetch club details and update logo)
      await loadLeaderboard()

      // Start refresh timer
      startRefreshTimer()

      // Manage cache size periodically
      StravaCache.manageCacheSize()
    } catch (error) {
      console.error('Failed to initialize app:', error)
      StravaUI.showError('Failed to initialize application. Please try again.')
    }
  }

  // Cleanup function
  function cleanup () {
    stopRefreshTimer()

    // Check cache health and clean up if needed
    const cacheHealth = StravaCache.checkCacheHealth()
    if (!cacheHealth.healthy) {
      console.warn('Cache health issues detected:', cacheHealth.issues)
      StravaCache.manageCacheSize()
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup)

  // Handle visibility change to pause/resume refresh when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopRefreshTimer()
    } else {
      startRefreshTimer()
    }
  })

  // Window resize and orientation change handlers (auto-scroll removed)
  // These are kept minimal since auto-scroll is disabled

  // Expose some functions for debugging (can be removed in production)
  window.StravaApp = {
    loadLeaderboard,
    getState: () => ({ ...appState }),
    getCacheStats: StravaCache.getCacheStats,
    testLocale: StravaUtils.testLocale,
    getTokenInfo: StravaAPI.getTokenInfo,
    probeToken: StravaAPI.probeCurrentToken,
    refreshToken: StravaAPI.refreshAccessToken,
    cleanup,

    // Auto-scroll functionality has been removed - showing top 10 athletes only
  }
})()
