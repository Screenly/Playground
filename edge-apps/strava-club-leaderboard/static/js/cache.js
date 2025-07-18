/* global */

// Cache management for Strava Club Leaderboard App
window.StravaCache = (function () {
  'use strict'

  // Configuration
  const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes - Conservative caching for frequent updates
  const CACHE_NAMESPACE = 'strava_club_' // Namespace for cache keys

  // Get cached data with expiration check
  function getCachedData (key) {
    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const parsedData = JSON.parse(cached)
        const { data, timestamp, customDuration } = parsedData
        const age = Date.now() - timestamp
        const cacheDuration = customDuration || CACHE_DURATION
        const isExpired = age > cacheDuration

        if (!isExpired) {
          return data
        } else {
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      localStorage.removeItem(key)
    }
    return null
  }

  // Set cached data with default duration
  function setCachedData (key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now()
      }))
    } catch (error) {
      // Silently handle cache write errors
    }
  }

  // Set cached data with custom duration
  function setCachedDataWithDuration (key, data, duration) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        timestamp: Date.now(),
        customDuration: duration
      }))
    } catch (error) {
      // Silently handle cache write errors
    }
  }

  // Clear all Strava-related cache
  function clearCache () {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_NAMESPACE)) {
        localStorage.removeItem(key)
      }
    })
  }

  // Clear cache on authentication change (token refresh/change)
  function clearCacheOnAuthChange () {
    console.log('Clearing cache due to authentication change')
    clearCache()
  }

  // Clear cache for specific club
  function clearCacheForClub (clubId) {
    const keysToRemove = []

    // Find all cache keys for this club (activities and details)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (
        key.startsWith(`${CACHE_NAMESPACE}activities_${clubId}_`) ||
        key === `${CACHE_NAMESPACE}details_${clubId}`
      )) {
        keysToRemove.push(key)
      }
    }

    // Remove found keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    console.log(`Cleared ${keysToRemove.length} cache entries for club ${clubId}`)
  }

  // Get cache size and statistics
  function getCacheStats () {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(key => key.startsWith(CACHE_NAMESPACE))

    let totalSize = 0
    const cacheInfo = cacheKeys.map(key => {
      const value = localStorage.getItem(key)
      const size = value ? value.length : 0
      totalSize += size

      try {
        const parsed = JSON.parse(value)
        return {
          key,
          size,
          timestamp: parsed.timestamp,
          age: Date.now() - parsed.timestamp
        }
      } catch (error) {
        return { key, size, timestamp: 0, age: 0 }
      }
    })

    return {
      totalKeys: cacheKeys.length,
      totalSize,
      cacheInfo: cacheInfo.sort((a, b) => b.age - a.age) // Sort by age, oldest first
    }
  }

  // Manage cache size by removing old entries
  function manageCacheSize (maxEntries = 50) {
    const stats = getCacheStats()

    if (stats.totalKeys > maxEntries) {
      // Remove oldest entries
      const toRemove = stats.cacheInfo.slice(maxEntries)
      toRemove.forEach(item => {
        localStorage.removeItem(item.key)
      })

      return toRemove.length
    }

    return 0
  }

  // Check if cache is healthy (not too many entries, not too large)
  function checkCacheHealth () {
    const stats = getCacheStats()
    const maxSize = 5 * 1024 * 1024 // 5MB limit
    const maxEntries = 100

    const issues = []

    if (stats.totalSize > maxSize) {
      issues.push(`Cache size too large: ${Math.round(stats.totalSize / 1024 / 1024)}MB`)
    }

    if (stats.totalKeys > maxEntries) {
      issues.push(`Too many cache entries: ${stats.totalKeys}`)
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats
    }
  }

  // Public API
  return {
    getCachedData,
    setCachedData,
    setCachedDataWithDuration,
    clearCache,
    clearCacheForClub,
    getCacheStats,
    manageCacheSize,
    checkCacheHealth
  }
})()
