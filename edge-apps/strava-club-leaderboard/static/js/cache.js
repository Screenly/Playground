/* global */

// Cache management for Strava Club Leaderboard App
// Integrates with refresh token functionality to ensure cache consistency
// - Automatically clears cache on token refresh to prevent stale data
// - Handles localStorage quota limits with automatic cleanup
// - Provides robust error handling and cache health monitoring
window.StravaCache = (function () {
  'use strict'

  console.log('StravaCache module loading...')

  // Configuration
  const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes - Conservative caching for frequent updates
  const CACHE_NAMESPACE = 'strava_club_' // Namespace for cache keys

  // Get cached data with expiration check
  function getCachedData (key) {
    try {
      const cached = localStorage.getItem(key)
      if (cached) {
        const parsedData = JSON.parse(cached)

        // Handle legacy cache entries (without version)
        const { data, timestamp, customDuration, version = 0 } = parsedData

        // Invalidate old cache versions
        if (version < 1) {
          localStorage.removeItem(key)
          return null
        }

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
      // Remove corrupted cache entries
      try {
        localStorage.removeItem(key)
      } catch (removeError) {
        console.warn('Failed to remove corrupted cache entry:', removeError)
      }
    }
    return null
  }

  // Set cached data with default duration
  function setCachedData (key, data) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        version: 1 // Cache version for future migrations
      }
      localStorage.setItem(key, JSON.stringify(cacheEntry))
    } catch (error) {
      // Handle quota exceeded errors
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        handleQuotaExceededError()
        // Try again after clearing
        try {
          localStorage.setItem(key, JSON.stringify(cacheEntry))
        } catch (retryError) {
          console.warn('Failed to cache data after cleanup:', retryError)
        }
      } else {
        console.warn('Cache write error:', error)
      }
    }
  }

  // Set cached data with custom duration
  function setCachedDataWithDuration (key, data, duration) {
    try {
      const cacheEntry = {
        data,
        timestamp: Date.now(),
        customDuration: duration,
        version: 1
      }
      localStorage.setItem(key, JSON.stringify(cacheEntry))
    } catch (error) {
      // Handle quota exceeded errors
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        handleQuotaExceededError()
        // Try again after clearing
        try {
          localStorage.setItem(key, JSON.stringify(cacheEntry))
        } catch (retryError) {
          console.warn('Failed to cache data after cleanup:', retryError)
        }
      } else {
        console.warn('Cache write error:', error)
      }
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
    const maxEntries = 50 // Reduced for more frequent cleanup

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

  // Generate cache key with namespace
  function getCacheKey (type, ...parts) {
    return `${CACHE_NAMESPACE}${type}_${parts.join('_')}`
  }

  // Clear cache on quota exceeded error
  function handleQuotaExceededError () {
    console.warn('localStorage quota exceeded, clearing cache')
    clearCache()
  }

  // Public API
  const cacheAPI = {
    getCachedData,
    setCachedData,
    setCachedDataWithDuration,
    clearCache,
    clearCacheForClub,
    clearCacheOnAuthChange,
    getCacheStats,
    manageCacheSize,
    checkCacheHealth,
    getCacheKey,
    handleQuotaExceededError
  }

  console.log('StravaCache module loaded with functions:', Object.keys(cacheAPI))

  // Test the getCacheKey function immediately
  try {
    const testKey = getCacheKey('test', 'key')
    console.log('getCacheKey test successful:', testKey)
  } catch (error) {
    console.error('getCacheKey test failed:', error)
  }

  return cacheAPI
})()
