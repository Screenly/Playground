/* eslint-disable no-unused-vars, no-undef, no-useless-catch */

/* global screenly, StravaCache */

// Strava API functions for Club Leaderboard App
window.StravaAPI = (function () {
  'use strict'

  // Debug: Check if StravaCache is properly loaded
  console.log('StravaAPI loading. StravaCache status:', {
    exists: typeof StravaCache !== 'undefined',
    functions: typeof StravaCache === 'object' ? Object.keys(StravaCache) : 'N/A'
  })

  // Configuration
  const CONFIG = {
    STRAVA_API_BASE: 'https://www.strava.com/api/v3',
    STRAVA_OAUTH_BASE: 'https://www.strava.com/oauth',
    MAX_ACTIVITIES_PER_REQUEST: 200,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    TOKEN_REFRESH_BUFFER: 300 // Refresh token 5 minutes before expiry
  }

  // Token management state
  let tokenRefreshPromise = null
  let tokenExpiresAt = null // Internal state for token expiry

  // Helper function to calculate token expiry information
  function getTokenExpiryInfo (includeExtended = false) {
    if (!tokenExpiresAt) return null

    const now = Math.floor(Date.now() / 1000)
    const secondsUntilExpiry = tokenExpiresAt - now
    const expiryInfo = {
      seconds: secondsUntilExpiry,
      minutes: Math.round(secondsUntilExpiry / 60),
      hours: Math.round(secondsUntilExpiry / 3600),
      expiryTime: new Date(tokenExpiresAt * 1000).toLocaleString(),
      expiryTimeISO: new Date(tokenExpiresAt * 1000).toISOString()
    }

    if (includeExtended) {
      expiryInfo.days = Math.round(secondsUntilExpiry / 86400)
      expiryInfo.isExpired = secondsUntilExpiry <= 0
      expiryInfo.needsRefresh = secondsUntilExpiry <= CONFIG.TOKEN_REFRESH_BUFFER
    }

    return expiryInfo
  }

  // Helper function to log token expiry information
  function logTokenExpiry (options = {}) {
    const expiryInfo = getTokenExpiryInfo(options.includeExtended)
    if (!expiryInfo) return null

    // Create a copy for logging (may exclude some fields)
    const logInfo = { ...expiryInfo }

    // Remove ISO format unless specifically requested
    if (!options.includeISO) {
      delete logInfo.expiryTimeISO
    }

    // Remove extended fields unless it's a summary log
    if (!options.includeSummary && !options.includeExtended) {
      delete logInfo.isExpired
      delete logInfo.needsRefresh
      delete logInfo.days
    }

    console.log('⏰ Token will expire in:', logInfo)
    return expiryInfo
  }



  // Check if token needs refresh (expires within buffer time)
  function needsTokenRefresh () {
    if (!tokenExpiresAt) return false // If no expiry time set, we'll handle 401s reactively

    const now = Math.floor(Date.now() / 1000)
    return (tokenExpiresAt - now) <= CONFIG.TOKEN_REFRESH_BUFFER
  }

  // Check if token is expired
  function isTokenExpired () {
    if (!tokenExpiresAt) return false // If no expiry time set, we'll handle 401s reactively

    const now = Math.floor(Date.now() / 1000)
    return now >= tokenExpiresAt
  }

  // Refresh access token using refresh token
  async function refreshAccessToken () {
    // If there's already a refresh in progress, wait for it
    if (tokenRefreshPromise) {
      return tokenRefreshPromise
    }

    const refreshToken = screenly.settings.refresh_token
    const clientId = screenly.settings.client_id
    const clientSecret = screenly.settings.client_secret

    if (!refreshToken || !clientId || !clientSecret) {
      throw new Error('Missing refresh token or client credentials. Please reconfigure your Strava authentication.')
    }

    console.log('Refreshing Strava access token...')

    tokenRefreshPromise = (async () => {
      try {
        const response = await fetch(`${CONFIG.STRAVA_OAUTH_BASE}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Token refresh failed: ${response.status} - ${errorData.message || response.statusText}`)
        }

        const tokenData = await response.json()

        // Update settings and internal state with new token data
        screenly.settings.access_token = tokenData.access_token
        screenly.settings.refresh_token = tokenData.refresh_token

        // Update internal expiry state (managed entirely in memory)
        tokenExpiresAt = tokenData.expires_at

        const expiryDate = new Date(tokenData.expires_at * 1000)
        const now = new Date()
        const secondsUntilExpiry = tokenData.expires_at - Math.floor(Date.now() / 1000)

        console.log('🎉 Access token refreshed successfully!')
        console.log('⏰ Token Details:', {
          expiresAt: expiryDate.toISOString(),
          expiresAtLocal: expiryDate.toLocaleString(),
          currentTime: now.toISOString(),
          secondsUntilExpiry: secondsUntilExpiry,
          minutesUntilExpiry: Math.round(secondsUntilExpiry / 60),
          hoursUntilExpiry: Math.round(secondsUntilExpiry / 3600)
        })

        // Clear cache on token refresh to avoid stale data
        if (StravaCache.clearCacheOnAuthChange) {
          StravaCache.clearCacheOnAuthChange()
          console.log('🧹 Cache cleared due to token refresh (clearCacheOnAuthChange)')
        } else if (StravaCache.clearCache) {
          console.log('🧹 Using fallback cache clear method')
          StravaCache.clearCache()
        }

        return tokenData.access_token
      } catch (error) {
        console.error('Failed to refresh access token:', error)
        throw error
      } finally {
        tokenRefreshPromise = null
      }
    })()

    return tokenRefreshPromise
  }

  // Probe current token to check if it's valid and get expiry info
  async function probeCurrentToken () {
    try {
      // Make a simple API call to check token validity
      const response = await fetch(`${CONFIG.STRAVA_API_BASE}/athlete`, {
        headers: {
          Authorization: `Bearer ${screenly.settings.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        console.log('✅ Current access token is valid')
        // If expires_at is not set, we can't determine exact expiry from this call
        // but we know the token works for now
        if (!tokenExpiresAt) {
          console.log('⚠️ Token expiry time not set - will handle expiry reactively when 401 occurs')
        } else {
          logTokenExpiry({ includeSummary: false })
        }
        return true
      } else if (response.status === 401) {
        console.log('❌ Current access token is expired, will attempt refresh')
        return false
      } else {
        console.warn('Unexpected response from token probe:', response.status)
        return false
      }
    } catch (error) {
      console.warn('Failed to probe current token:', error)
      return false
    }
  }

    // Ensure valid access token
  async function ensureValidToken () {
    const now = Math.floor(Date.now() / 1000)

    console.log('🔐 Token validation check:', {
      hasExpiryTime: !!tokenExpiresAt,
      expiresAt: tokenExpiresAt ? new Date(tokenExpiresAt * 1000).toISOString() : 'Unknown',
      currentTime: new Date(now * 1000).toISOString(),
      secondsUntilExpiry: tokenExpiresAt ? tokenExpiresAt - now : 'Unknown',
      needsRefresh: tokenExpiresAt ? needsTokenRefresh() : false,
      isExpired: tokenExpiresAt ? isTokenExpired() : false
    })

    // Always show expiry details if we have them
    logTokenExpiry({ includeISO: true, includeSummary: true }) // Include ISO format for detailed validation

    // If we don't have expiry info, probe the current token first
    if (!tokenExpiresAt) {
      console.log('⏰ No token expiry time available, probing current token...')
      const isValid = await probeCurrentToken()
      if (!isValid) {
        // Current token is invalid, try to refresh
        try {
          console.log('🔄 Token invalid, attempting refresh...')
          await refreshAccessToken()
        } catch (error) {
          console.error('❌ Token refresh failed during probe:', error)
          throw new Error('Authentication failed. Please check your Strava credentials and try again.')
        }
      }
      return // Exit early since we just probed/refreshed
    }

    // Check if token needs refresh or is expired (only if we have expiry info)
    if (needsTokenRefresh() || isTokenExpired()) {
      try {
        console.log('🔄 Token needs refresh, attempting refresh...')
        await refreshAccessToken()
      } catch (error) {
        console.error('❌ Token refresh failed:', error)
        throw new Error('Authentication failed. Please check your Strava credentials and try again.')
      }
    } else {
      console.log('✅ Token is valid and fresh')
    }
  }

  // Make authenticated request to Strava API with automatic token refresh
  async function makeStravaRequest (url, options = {}) {
    // Ensure we have a valid token before making the request
    await ensureValidToken()

    // Show current token status before making request
    console.log(`🚀 Making API request to: ${url}`)
    if (tokenExpiresAt) {
      const expiryInfo = getTokenExpiryInfo()
      console.log('⏰ Current token expires in:', {
        minutes: expiryInfo.minutes,
        hours: expiryInfo.hours,
        expiryTime: expiryInfo.expiryTime
      })
    } else {
      console.log('⏰ No token expiry time available')
    }

    const headers = {
      Authorization: `Bearer ${screenly.settings.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

              // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          console.log('❌ Received 401 Unauthorized, attempting token refresh...')
          console.log('🔐 Current token state:', {
            hasExpiryTime: !!tokenExpiresAt,
            expiresAt: tokenExpiresAt ? new Date(tokenExpiresAt * 1000).toLocaleString() : 'Unknown',
            url: url
          })

        try {
          await refreshAccessToken()

                    // Retry the request with new token
          const retryHeaders = {
            ...headers,
            Authorization: `Bearer ${screenly.settings.access_token}`
          }

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders
          })

          if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}))
            throw new Error(`Strava API error: ${retryResponse.status} - ${errorData.message || retryResponse.statusText}`)
          }

          console.log('✅ API request succeeded after token refresh')
          return await retryResponse.json()
        } catch (refreshError) {
          console.error('Token refresh failed after 401:', refreshError)
          throw new Error('Authentication failed. Please reconfigure your Strava credentials.')
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Strava API error: ${response.status} - ${errorData.message || response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      throw error
    }
  }

    // Fetch club details with caching
  async function fetchClubDetails (clubId) {
        // Check cache first - club details don't change often, so cache for 1 hour
    const cacheKey = StravaCache.getCacheKey ?
      StravaCache.getCacheKey('details', clubId) :
      `strava_club_details_${clubId}`

    if (!cacheKey) {
      console.warn('❌ Failed to generate cache key for club details')
      // Proceed without caching
    }

        console.log('🔍 Fetching club details:', { clubId, cacheKey })

    const cachedData = cacheKey ? StravaCache.getCachedData(cacheKey) : null
    if (cachedData) {
      console.log('✅ Club details loaded from cache using key:', cacheKey)
      return cachedData
    }

    try {
      const url = `${CONFIG.STRAVA_API_BASE}/clubs/${clubId}`
      const clubData = await makeStravaRequest(url)

      // Cache club details for 1 hour since they rarely change
      if (clubData && cacheKey) {
        const cached = StravaCache.setCachedDataWithDuration(cacheKey, clubData, 60 * 60 * 1000) // 1 hour
        if (cached) {
          console.log('💾 Club details cached for 1 hour using key:', cacheKey)
        }
      }

      return clubData
    } catch (error) {
      console.error('Failed to fetch club details:', error)
      return null
    }
  }

  // Fetch detailed activity information
  async function fetchDetailedActivity (activityId) {
    const url = `${CONFIG.STRAVA_API_BASE}/activities/${activityId}`
    try {
      const detailedActivity = await makeStravaRequest(url)
      return detailedActivity
    } catch (error) {
      return null
    }
  }

    // Fetch club activities with caching and pagination
  async function fetchClubActivities (clubId, page = 1) {
        const cacheKey = StravaCache.getCacheKey ?
      StravaCache.getCacheKey('activities', clubId, 'recent', page) :
      `strava_club_activities_${clubId}_recent_${page}`

    if (!cacheKey) {
      console.warn('❌ Failed to generate cache key for club activities')
      // Proceed without caching
    }

    console.log(`🔍 Fetching club activities page ${page}:`, { clubId, page, cacheKey })

    // Check cache first
    const cachedData = cacheKey ? StravaCache.getCachedData(cacheKey) : null
    if (cachedData) {
      console.log(`✅ Club activities page ${page} loaded from cache using key:`, cacheKey)
      return cachedData
    }

    const url = `${CONFIG.STRAVA_API_BASE}/clubs/${clubId}/activities`
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: CONFIG.MAX_ACTIVITIES_PER_REQUEST.toString()
    })

    try {
      const activities = await makeStravaRequest(`${url}?${params}`)

      // Handle case where API returns non-array
      if (!Array.isArray(activities)) {
        throw new Error(`API returned invalid response type: ${typeof activities}`)
      }

      // Remove the technical warning message - we'll show a user-friendly note in the footer instead
      const existingWarning = document.querySelector('.alert-warning')
      if (existingWarning) {
        existingWarning.remove()
      }

      // Return all activities without time filtering
      const processedActivities = activities

      // Cache the processed activities (10 minutes default)
      if (cacheKey) {
        const cached = StravaCache.setCachedData(cacheKey, processedActivities)
        if (cached) {
          console.log(`💾 Club activities page ${page} cached for 10 minutes using key:`, cacheKey)
        }
      }

      return processedActivities
    } catch (error) {
      console.error(`Failed to fetch club activities page ${page}:`, error)
      throw error
    }
  }

  // Fetch all club activities with pagination
  async function fetchAllClubActivities (clubId) {
    const allActivities = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      try {
        const activities = await fetchClubActivities(clubId, page)

        if (activities.length === 0) {
          hasMore = false
        } else {
          allActivities.push(...activities)
          page++

          // Limit to reasonable number of pages to avoid rate limiting
          if (page > 5) {
            hasMore = false
          }
        }
      } catch (error) {
        hasMore = false
      }
    }

    return allActivities
  }

  // Process activities into leaderboard format
  function processLeaderboard (activities) {
    const athleteStats = {}

    activities.forEach(activity => {
      // Handle missing athlete ID by using name as fallback
      const athleteId = activity.athlete.id || `${activity.athlete.firstname}_${activity.athlete.lastname}`
      const athleteName = `${activity.athlete.firstname} ${activity.athlete.lastname}`

      if (!athleteStats[athleteId]) {
        athleteStats[athleteId] = {
          id: athleteId,
          name: athleteName,
          firstname: activity.athlete.firstname,
          lastname: activity.athlete.lastname,
          totalDistance: 0,
          totalTime: 0,
          totalElevation: 0,
          activityCount: 0,
          activities: []
        }
      }

      const stats = athleteStats[athleteId]
      stats.totalDistance += activity.distance || 0
      stats.totalTime += activity.moving_time || 0
      stats.totalElevation += activity.total_elevation_gain || 0
      stats.activityCount++
      stats.activities.push(activity)
    })

    // Convert to array and sort by total distance
    const leaderboard = Object.values(athleteStats)
      .sort((a, b) => b.totalDistance - a.totalDistance)

    // Limit to max athletes setting
    const maxAthletes = parseInt(screenly.settings.max_athletes) || 20

    return leaderboard.slice(0, maxAthletes)
  }

          // Get token info for debugging
  function getTokenInfo () {
    console.log('🔍 Getting token info...')

    if (!tokenExpiresAt) {
      const tokenInfo = {
        status: 'Token expiry time not set - will be auto-detected on first API call',
        hasRefreshToken: !!screenly.settings.refresh_token,
        hasClientSecret: !!screenly.settings.client_secret,
        hasAccessToken: !!screenly.settings.access_token,
        internalExpiryState: 'Not initialized'
      }
      console.log('⚠️ Token info (no expiry):', tokenInfo)
      return tokenInfo
    }

    const now = Math.floor(Date.now() / 1000)
    const secondsUntilExpiry = tokenExpiresAt - now
    const expiryDate = new Date(tokenExpiresAt * 1000)

    const tokenInfo = {
      expiresAt: expiryDate,
      expiresAtISO: expiryDate.toISOString(),
      expiresAtLocal: expiryDate.toLocaleString(),
      currentTime: new Date().toISOString(),
      secondsUntilExpiry,
      minutesUntilExpiry: Math.round(secondsUntilExpiry / 60),
      hoursUntilExpiry: Math.round(secondsUntilExpiry / 3600),
      isExpired: secondsUntilExpiry <= 0,
      needsRefresh: secondsUntilExpiry <= CONFIG.TOKEN_REFRESH_BUFFER,
      refreshBufferSeconds: CONFIG.TOKEN_REFRESH_BUFFER,
      status: 'Token expiry managed entirely in JavaScript memory',
      internalExpiryState: 'Active'
    }

    console.log('⏰ Token info:', tokenInfo)
    return tokenInfo
  }

  // Show current token expiry status (for debugging)
  function showTokenExpiry () {
    console.log('🔍 Manual token expiry check...')
    if (!tokenExpiresAt) {
      console.log('⚠️ No token expiry time available')
      return null
    }

    const expiryInfo = getTokenExpiryInfo(true) // Include extended info
    console.log('⏰ Token will expire in:', expiryInfo)
    return expiryInfo
  }

  // Public API
  return {
    fetchClubDetails,
    fetchDetailedActivity,
    fetchClubActivities,
    fetchAllClubActivities,
    processLeaderboard,
    makeStravaRequest,
    refreshAccessToken,
    probeCurrentToken,
    getTokenInfo,
    getTokenExpiryInfo,
    showTokenExpiry,
    needsTokenRefresh,
    isTokenExpired
  }
})()
