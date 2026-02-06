/* eslint-disable no-unused-vars */

/* global */

// Cache management for Strava Club Leaderboard App
// Integrates with refresh token functionality to ensure cache consistency
// - Automatically clears cache on token refresh to prevent stale data
// - Handles localStorage quota limits with automatic cleanup
// - Provides robust error handling and cache health monitoring
window.StravaCache = (function () {
  'use strict'

  // Configuration
  const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes - Balance between freshness and rate limits
  const CACHE_NAMESPACE = 'strava_club_' // Namespace for cache keys

  // Get cached data with expiration check
  function getCachedData(key) {
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

  // Helper function for cache write with error handling
  function writeToCache(key, cacheEntry) {
    try {
      localStorage.setItem(key, JSON.stringify(cacheEntry))
      return true
    } catch (error) {
      // Handle quota exceeded errors
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('💾 Cache quota exceeded, attempting cleanup...')
        handleQuotaExceededError()

        // Try again after clearing
        try {
          localStorage.setItem(key, JSON.stringify(cacheEntry))
          return true
        } catch (retryError) {
          console.warn('❌ Failed to cache data after cleanup:', retryError)
          return false
        }
      } else {
        console.warn('❌ Cache write error:', error)
        return false
      }
    }
  }

  // Set cached data with default duration
  function setCachedData(key, data) {
    if (!key || data === undefined) {
      console.warn('❌ Invalid cache parameters:', {
        key,
        hasData: data !== undefined,
      })
      return false
    }

    const cacheEntry = {
      data,
      timestamp: Date.now(),
      version: 1, // Cache version for future migrations
    }

    return writeToCache(key, cacheEntry)
  }

  // Set cached data with custom duration
  function setCachedDataWithDuration(key, data, duration) {
    if (!key || data === undefined || !duration || duration <= 0) {
      console.warn('❌ Invalid cache parameters:', {
        key,
        hasData: data !== undefined,
        duration,
      })
      return false
    }

    const cacheEntry = {
      data,
      timestamp: Date.now(),
      customDuration: duration,
      version: 1,
    }

    return writeToCache(key, cacheEntry)
  }

  // Clear all Strava-related cache
  function clearCache() {
    const keysToRemove = []

    // Collect all matching keys first (avoid modifying during iteration)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_NAMESPACE)) {
        keysToRemove.push(key)
      }
    }

    // Remove collected keys
    keysToRemove.forEach((key) => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.warn('Failed to remove cache key:', key, error)
      }
    })
  }

  // Clear cache on authentication change (token refresh/change)
  function clearCacheOnAuthChange() {
    clearCache()
  }

  // Clear cache for specific club
  function clearCacheForClub(clubId) {
    const keysToRemove = []

    // Find all cache keys for this club (activities and details)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (
        key &&
        (key.startsWith(`${CACHE_NAMESPACE}activities_${clubId}_`) ||
          key === `${CACHE_NAMESPACE}details_${clubId}`)
      ) {
        keysToRemove.push(key)
      }
    }

    // Remove found keys
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key)
    })
  }

  // Get cache size and statistics
  function getCacheStats() {
    const cacheInfo = []
    let totalSize = 0

    // Iterate through localStorage properly
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(CACHE_NAMESPACE)) {
        try {
          const value = localStorage.getItem(key)
          const size = value ? value.length : 0
          totalSize += size

          const parsed = JSON.parse(value)
          cacheInfo.push({
            key,
            size,
            timestamp: parsed.timestamp || 0,
            age: parsed.timestamp ? Date.now() - parsed.timestamp : 0,
            version: parsed.version || 0,
            hasCustomDuration: !!parsed.customDuration,
            customDuration: parsed.customDuration,
          })
        } catch (error) {
          // Handle corrupted entries
          cacheInfo.push({
            key,
            size: 0,
            timestamp: 0,
            age: 0,
            corrupted: true,
          })
        }
      }
    }

    return {
      totalKeys: cacheInfo.length,
      totalSize,
      totalSizeMB: Math.round((totalSize / 1024 / 1024) * 100) / 100,
      cacheInfo: cacheInfo.sort((a, b) => b.age - a.age), // Sort by age, oldest first
    }
  }

  // Manage cache size by removing old entries
  function manageCacheSize(maxEntries = 50) {
    const stats = getCacheStats()
    let removedCount = 0

    // Remove corrupted entries first
    const corruptedEntries = stats.cacheInfo.filter((item) => item.corrupted)
    corruptedEntries.forEach((item) => {
      try {
        localStorage.removeItem(item.key)
        removedCount++
      } catch (error) {
        console.warn('Failed to remove corrupted cache entry:', item.key)
      }
    })

    // Then remove oldest entries if still over limit
    const validEntries = stats.cacheInfo.filter((item) => !item.corrupted)
    if (validEntries.length > maxEntries) {
      const toRemove = validEntries.slice(maxEntries)
      toRemove.forEach((item) => {
        try {
          localStorage.removeItem(item.key)
          removedCount++
        } catch (error) {
          console.warn('Failed to remove cache entry:', item.key)
        }
      })
    }

    return removedCount
  }

  // Check if cache is healthy (not too many entries, not too large)
  function checkCacheHealth() {
    const stats = getCacheStats()
    const maxSize = 5 * 1024 * 1024 // 5MB limit
    const maxEntries = 50 // Reduced for more frequent cleanup

    const issues = []

    if (stats.totalSize > maxSize) {
      issues.push(
        `Cache size too large: ${Math.round(stats.totalSize / 1024 / 1024)}MB`,
      )
    }

    if (stats.totalKeys > maxEntries) {
      issues.push(`Too many cache entries: ${stats.totalKeys}`)
    }

    return {
      healthy: issues.length === 0,
      issues,
      stats,
    }
  }

  // Generate cache key with namespace and validation
  function getCacheKey(type, ...parts) {
    if (!type) {
      console.warn('❌ Cache key type is required')
      return null
    }

    // Filter out null/undefined parts and convert to string
    const validParts = parts
      .filter((part) => part !== null && part !== undefined)
      .map((part) => String(part))

    if (validParts.length === 0) {
      console.warn(
        '❌ Cache key requires at least one additional part beyond type',
      )
      return null
    }

    const key = `${CACHE_NAMESPACE}${type}_${validParts.join('_')}`

    // Validate key length (localStorage keys have practical limits)
    if (key.length > 100) {
      console.warn('⚠️ Cache key is very long, may cause issues:', key.length)
    }

    return key
  }

  // Clear cache on quota exceeded error
  function handleQuotaExceededError() {
    console.warn('💾 localStorage quota exceeded, performing cleanup...')

    // First try to clean up old entries
    const removedCount = manageCacheSize(20) // More aggressive cleanup

    if (removedCount === 0) {
      // If no old entries to remove, clear all cache
      console.warn('💾 No old entries found, clearing all cache')
      clearCache()
    }
  }

  // Add cache cleanup with detailed reporting
  function cleanupCache() {
    const statsBefore = getCacheStats()
    const removedCount = manageCacheSize()
    const statsAfter = getCacheStats()

    return { statsBefore, statsAfter, removedCount }
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
    handleQuotaExceededError,
    cleanupCache,
  }

  return cacheAPI
})()
