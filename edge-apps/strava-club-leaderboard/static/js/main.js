/* global screenly, StravaUtils, StravaCache, StravaAPI, StravaUI */

// Strava Club Leaderboard App - Main Application Logic
;(function () {
  'use strict'

  // Configuration
  const CONFIG = {
    REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes - Conservative for API rate limits (100 req/15min, 1000/day)
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  }

  // State management
  const appState = {
    isLoading: false,
    hasError: false,
    activities: [],
    leaderboard: [],
    lastUpdate: null,
    refreshTimer: null,
    // Note: Time filtering is never available due to Strava Club Activities API limitations
  }

  // Helper function to get athlete count based on screen orientation
  function getAthleteCountForOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight
    return isLandscape ? 6 : 14 // 6 for landscape, 14 for portrait
  }

  // Re-render leaderboard with appropriate athlete count for current orientation
  function updateLeaderboardForOrientation() {
    if (appState.leaderboard && appState.leaderboard.length > 0) {
      const athleteCount = getAthleteCountForOrientation()
      StravaUI.renderLeaderboard(appState.leaderboard.slice(0, athleteCount))
    }
  }

  // Handle orientation change with delay
  const handleOrientationChange = () => {
    // Small delay to ensure orientation change is complete
    setTimeout(updateLeaderboardForOrientation, 100)
  }

  // Main application logic
  async function loadLeaderboard() {
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
        throw new Error(
          'Club ID is required. Please configure your Strava club ID.',
        )
      }

      const accessToken = screenly.settings.access_token
      if (!accessToken) {
        throw new Error(
          'Access token is required. Please configure your Strava access token.',
        )
      }

      // Fetch club details and update logo
      const clubData = await StravaAPI.fetchClubDetails(clubId)

      // Note: Don't clear cache here anymore - let it expire naturally or clear on token refresh
      // This reduces API calls and respects rate limits better

      // Note: Strava Club Activities API does not return date fields,
      // so time-based filtering is not possible. Showing all recent activities.
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
      StravaUI.renderLeaderboard(
        leaderboard.slice(0, getAthleteCountForOrientation()),
      ) // Responsive athlete count
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
  function startRefreshTimer() {
    if (appState.refreshTimer) {
      clearInterval(appState.refreshTimer)
    }

    appState.refreshTimer = setInterval(() => {
      loadLeaderboard()
    }, CONFIG.REFRESH_INTERVAL)
  }

  // Stop refresh timer
  function stopRefreshTimer() {
    if (appState.refreshTimer) {
      clearInterval(appState.refreshTimer)
      appState.refreshTimer = null
    }
  }

  // Initialize application
  async function init() {
    try {
      // Initialize UI with default elements
      StravaUI.initializeUI()

      // Load leaderboard (this will also fetch club details and update logo)
      await loadLeaderboard()

      // Start refresh timer
      startRefreshTimer()

      // Manage cache size periodically
      StravaCache.manageCacheSize()

      // Check cache health
      const cacheHealth = StravaCache.checkCacheHealth()
      if (!cacheHealth.healthy) {
        StravaCache.manageCacheSize()
      }
    } catch (error) {
      console.error('Failed to initialize app:', error)
      StravaUI.showError('Failed to initialize application. Please try again.')
    }
  }

  // Cleanup function
  function cleanup() {
    stopRefreshTimer()

    // Remove event listeners
    window.removeEventListener('resize', updateLeaderboardForOrientation)
    window.removeEventListener('orientationchange', handleOrientationChange)

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

  // Window resize and orientation change handlers
  window.addEventListener('resize', updateLeaderboardForOrientation)
  window.addEventListener('orientationchange', handleOrientationChange)

  // Expose some functions for debugging (can be removed in production)
  window.StravaApp = {
    loadLeaderboard,
    getState: () => ({ ...appState }),
    getCacheStats: StravaCache.getCacheStats,
    clearCache: StravaCache.clearCache,
    clearCacheForClub: StravaCache.clearCacheForClub,
    checkCacheHealth: StravaCache.checkCacheHealth,
    cleanupCache: StravaCache.cleanupCache,
    testLocale: StravaUtils.testLocale,
    getTokenInfo: StravaAPI.getTokenInfo,
    getTokenExpiryInfo: StravaAPI.getTokenExpiryInfo,
    showTokenExpiry: StravaAPI.showTokenExpiry,
    probeToken: StravaAPI.probeCurrentToken,
    refreshToken: StravaAPI.refreshAccessToken,
    cleanup,

    // Orientation-responsive athlete count functionality
    getAthleteCountForOrientation,
    updateLeaderboardForOrientation,
    getCurrentOrientation: () =>
      window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
  }
})()
