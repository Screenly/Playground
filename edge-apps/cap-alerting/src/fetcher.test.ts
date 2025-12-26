/**
 * Unit tests for CAPFetcher
 */

import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { CAPFetcher } from './fetcher'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

// Mock fetch
const mockFetch = mock()

// Helper to wait for a condition
const waitFor = async (condition: () => boolean, timeout = 5000) => {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
}

describe('CAPFetcher', () => {
  beforeEach(() => {
    // Setup mocks
    global.localStorage = localStorageMock as any
    global.fetch = mockFetch as any
    global.window = {
      setInterval,
      clearInterval,
      setTimeout,
      clearTimeout,
    } as any

    // Clear localStorage before each test
    localStorageMock.clear()

    // Reset fetch mock
    mockFetch.mockReset()
  })

  afterEach(() => {
    mockFetch.mockRestore()
  })

  describe('Constructor', () => {
    it('should create a fetcher with default config', () => {
      const fetcher = new CAPFetcher({})
      expect(fetcher).toBeDefined()
      expect(fetcher.getStats().isRunning).toBe(false)
    })

    it('should create a fetcher with custom config', () => {
      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        refreshInterval: 60,
        maxRetries: 3,
      })
      expect(fetcher).toBeDefined()
    })
  })

  describe('Caching', () => {
    it('should save valid data to cache', async () => {
      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      // Wait for the fetch to complete
      await waitFor(() => updateCallback.mock.calls.length > 0)

      // Check that data was cached
      const cached = localStorageMock.getItem('cap_feed_cache')
      expect(cached).toBe(mockData)

      // Check that metadata was saved
      const meta = JSON.parse(
        localStorageMock.getItem('cap_feed_cache_meta') || '{}',
      )
      expect(meta.isValid).toBe(true)
      expect(meta.timestamp).toBeDefined()

      fetcher.stop()
    })

    it('should not cache empty data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => mockFetch.mock.calls.length > 0)

      // Check that nothing was cached
      const cached = localStorageMock.getItem('cap_feed_cache')
      expect(cached).toBeNull()

      fetcher.stop()
    })

    it('should not cache invalid XML data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => 'This is not XML',
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => mockFetch.mock.calls.length > 0)

      // Check that data was not cached
      const cached = localStorageMock.getItem('cap_feed_cache')
      expect(cached).toBeNull()

      fetcher.stop()
    })

    it('should use atomic write for cache', async () => {
      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'

      // Set up existing cache
      localStorageMock.setItem('cap_feed_cache', 'old data')

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0)

      // Verify cache was updated
      const cached = localStorageMock.getItem('cap_feed_cache')
      expect(cached).toBe(mockData)

      // Verify temp keys were cleaned up
      const tempCache = localStorageMock.getItem('cap_feed_cache_temp')
      expect(tempCache).toBeNull()

      fetcher.stop()
    })

    it('should load from cache if initial fetch fails', async () => {
      const cachedData =
        '<?xml version="1.0"?><alert><identifier>CACHED</identifier></alert>'

      // Set up cache
      localStorageMock.setItem('cap_feed_cache', cachedData)
      localStorageMock.setItem(
        'cap_feed_cache_meta',
        JSON.stringify({
          data: '',
          timestamp: Date.now(),
          isValid: true,
        }),
      )

      mockFetch.mockRejectedValue(new Error('Network error'))

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 2,
        initialRetryDelay: 100,
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0, 3000)

      // Should have called with cached data
      expect(updateCallback.mock.calls[0][0]).toBe(cachedData)

      fetcher.stop()
    })
  })

  describe('Retry Logic', () => {
    it('should retry on fetch failure', async () => {
      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'

      // Fail first two attempts, succeed on third
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          text: async () => mockData,
        })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 3,
        initialRetryDelay: 100,
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0, 3000)

      expect(mockFetch.mock.calls.length).toBe(3)
      expect(updateCallback.mock.calls[0][0]).toBe(mockData)

      fetcher.stop()
    })

    it('should fall back to cache after all retries exhausted', async () => {
      const cachedData =
        '<?xml version="1.0"?><alert><identifier>CACHED</identifier></alert>'

      // Set up cache
      localStorageMock.setItem('cap_feed_cache', cachedData)
      localStorageMock.setItem(
        'cap_feed_cache_meta',
        JSON.stringify({
          data: '',
          timestamp: Date.now(),
          isValid: true,
        }),
      )

      mockFetch.mockRejectedValue(new Error('Network error'))

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 2,
        initialRetryDelay: 100,
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0, 3000)

      expect(updateCallback.mock.calls[0][0]).toBe(cachedData)

      fetcher.stop()
    })

    it('should use exponential backoff', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 3,
        initialRetryDelay: 100,
      })

      const updateCallback = mock()
      const startTime = Date.now()

      fetcher.start(updateCallback)

      await waitFor(() => mockFetch.mock.calls.length >= 3, 3000)

      const elapsed = Date.now() - startTime

      // Should take at least 100ms (1st retry) + 200ms (2nd retry) = 300ms
      // With jitter, it could be slightly less, so check for at least 200ms
      expect(elapsed).toBeGreaterThan(200)

      fetcher.stop()
    })
  })

  describe('HTTP Handling', () => {
    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 1,
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0, 2000)

      // Should call with null since no cache exists
      expect(updateCallback.mock.calls[0][0]).toBeNull()

      fetcher.stop()
    })

    it('should add CORS proxy for http/https URLs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '<?xml version="1.0"?><alert></alert>',
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => mockFetch.mock.calls.length > 0)

      expect(mockFetch.mock.calls[0][0]).toBe(
        'https://proxy.com/https://example.com/feed.xml',
      )

      fetcher.stop()
    })

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 1,
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => mockFetch.mock.calls.length > 0)

      // Should not cache or call callback with empty data
      const cached = localStorageMock.getItem('cap_feed_cache')
      expect(cached).toBeNull()

      fetcher.stop()
    })
  })

  describe('Stats', () => {
    it('should track statistics', async () => {
      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()

      let initialStats = fetcher.getStats()
      expect(initialStats.isRunning).toBe(false)
      expect(initialStats.lastSuccessfulFetch).toBe(0)
      expect(initialStats.consecutiveFailures).toBe(0)

      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0)

      const stats = fetcher.getStats()
      expect(stats.isRunning).toBe(true)
      expect(stats.lastSuccessfulFetch).toBeGreaterThan(0)
      expect(stats.cacheAge).toBeLessThan(5) // Should be very recent

      fetcher.stop()
    })

    it('should track consecutive failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 2,
        initialRetryDelay: 100,
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => mockFetch.mock.calls.length >= 2, 2000)

      const stats = fetcher.getStats()
      expect(stats.consecutiveFailures).toBeGreaterThan(0)

      fetcher.stop()
    })
  })

  describe('Start and Stop', () => {
    it('should not start if already running', async () => {
      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()

      fetcher.start(updateCallback)
      await waitFor(() => fetcher.getStats().isRunning)

      // Try to start again - should log warning
      const consoleWarn = mock()
      const originalWarn = console.warn
      console.warn = consoleWarn

      fetcher.start(updateCallback)
      expect(consoleWarn.mock.calls.length).toBeGreaterThan(0)

      console.warn = originalWarn
      fetcher.stop()
    })

    it('should stop properly', async () => {
      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => fetcher.getStats().isRunning)

      fetcher.stop()

      expect(fetcher.getStats().isRunning).toBe(false)
    })
  })

  describe('Force Refresh', () => {
    it('should force an immediate refresh', async () => {
      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'
      mockFetch.mockResolvedValue({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()

      await fetcher.forceRefresh(updateCallback)

      expect(mockFetch.mock.calls.length).toBe(1)
      expect(updateCallback.mock.calls[0][0]).toBe(mockData)
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing feed URL', async () => {
      const fetcher = new CAPFetcher({
        feedUrl: '',
        corsProxyUrl: 'https://proxy.com',
        maxRetries: 1,
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0, 2000)

      expect(updateCallback.mock.calls[0][0]).toBeNull()

      fetcher.stop()
    })

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw errors
      const originalSetItem = localStorageMock.setItem
      localStorageMock.setItem = mock(() => {
        throw new Error('QuotaExceededError')
      })

      const mockData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0)

      // Should still return data even though caching failed
      expect(updateCallback.mock.calls[0][0]).toBe(mockData)

      // Restore original
      localStorageMock.setItem = originalSetItem

      fetcher.stop()
    })

    it('should handle corrupted cache metadata', async () => {
      // Set up corrupted metadata
      localStorageMock.setItem(
        'cap_feed_cache',
        '<?xml version="1.0"?><alert></alert>',
      )
      localStorageMock.setItem('cap_feed_cache_meta', 'invalid json')

      const mockData =
        '<?xml version="1.0"?><alert><identifier>NEW</identifier></alert>'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0)

      // Should fetch fresh data instead of using corrupted cache
      expect(updateCallback.mock.calls[0][0]).toBe(mockData)

      fetcher.stop()
    })

    it('should return null when cache has invalid flag', async () => {
      // Set up cache with invalid flag
      localStorageMock.setItem(
        'cap_feed_cache',
        '<?xml version="1.0"?><alert></alert>',
      )
      localStorageMock.setItem(
        'cap_feed_cache_meta',
        JSON.stringify({
          data: '',
          timestamp: Date.now(),
          isValid: false,
        }),
      )

      const mockData =
        '<?xml version="1.0"?><alert><identifier>NEW</identifier></alert>'
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => mockData,
      })

      const fetcher = new CAPFetcher({
        feedUrl: 'https://example.com/feed.xml',
        corsProxyUrl: 'https://proxy.com',
      })

      const updateCallback = mock()
      fetcher.start(updateCallback)

      await waitFor(() => updateCallback.mock.calls.length > 0)

      // Should fetch fresh data
      expect(updateCallback.mock.calls[0][0]).toBe(mockData)

      fetcher.stop()
    })
  })
})
