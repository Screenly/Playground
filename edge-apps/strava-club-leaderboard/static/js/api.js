/* global screenly, StravaCache */

// Strava API functions for Club Leaderboard App
window.StravaAPI = (function () {
  'use strict'

  // Configuration
  const CONFIG = {
    STRAVA_API_BASE: 'https://www.strava.com/api/v3',
    MAX_ACTIVITIES_PER_REQUEST: 200,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
  }

  // Make authenticated request to Strava API
  async function makeStravaRequest (url, options = {}) {
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
    const cacheKey = `club_details_${clubId}`
    const cachedData = StravaCache.getCachedData(cacheKey)
    if (cachedData) {
      return cachedData
    }

    try {
      const url = `${CONFIG.STRAVA_API_BASE}/clubs/${clubId}`
      const clubData = await makeStravaRequest(url)

      // Cache club details for 1 hour since they rarely change
      if (clubData) {
        StravaCache.setCachedDataWithDuration(cacheKey, clubData, 60 * 60 * 1000) // 1 hour
      }

      return clubData
    } catch (error) {
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
    const cacheKey = `club_activities_${clubId}_recent_${page}`

    // Check cache first
    const cachedData = StravaCache.getCachedData(cacheKey)
    if (cachedData) {
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

      // Cache the processed activities
      StravaCache.setCachedData(cacheKey, processedActivities)

      return processedActivities
    } catch (error) {
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
    const maxAthletes = parseInt(screenly.settings.max_athletes) || 10

    return leaderboard.slice(0, maxAthletes)
  }

  // Public API
  return {
    fetchClubDetails,
    fetchDetailedActivity,
    fetchClubActivities,
    fetchAllClubActivities,
    processLeaderboard,
    makeStravaRequest
  }
})()
