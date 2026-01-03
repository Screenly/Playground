import { describe, it, expect, beforeEach, mock } from 'bun:test'
import { CAPFetcher } from './fetcher'

// Mock the @screenly/edge-apps module
const mockGetCorsProxyUrl = mock()
const mockIsAnywhereScreen = mock()

mock.module('@screenly/edge-apps', () => ({
  getCorsProxyUrl: () => mockGetCorsProxyUrl(),
  isAnywhereScreen: () => mockIsAnywhereScreen(),
  setupTheme: () => {},
  signalReady: () => {},
  getMetadata: () => ({}),
  getTags: () => [],
  getSettings: () => ({}),
}))

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

describe('CAPFetcher', () => {
  beforeEach(() => {
    // Setup mocks
    global.localStorage = localStorageMock as unknown
    global.fetch = mockFetch as unknown

    // Clear localStorage
    localStorageMock.clear()

    // Reset mocks
    mockFetch.mockReset()
    mockGetCorsProxyUrl.mockReset()
    mockIsAnywhereScreen.mockReset()

    // Default mock implementations
    mockGetCorsProxyUrl.mockReturnValue('https://cors-proxy.example.com')
    mockIsAnywhereScreen.mockReturnValue(false)
  })

  describe('Test Mode', () => {
    it('should fetch test data from static/test.cap', async () => {
      const testData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => testData,
      })

      const fetcher = new CAPFetcher({
        testMode: true,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(testData)
      expect(mockFetch.mock.calls[0][0]).toBe('static/test.cap')
    })

    it('should return null if test file not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const fetcher = new CAPFetcher({
        testMode: true,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBeNull()
    })

    it('should handle fetch errors in test mode', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const fetcher = new CAPFetcher({
        testMode: true,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBeNull()
    })
  })

  describe('Demo Mode', () => {
    it('should fetch random demo file on local screen', async () => {
      const demoData =
        '<?xml version="1.0"?><alert><identifier>DEMO</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => demoData,
      })

      mockIsAnywhereScreen.mockReturnValueOnce(false)

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: true,
        feedUrl: '',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(demoData)
      // Should fetch from static directory
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toMatch(/^static\/demo-/)
    })

    it('should fetch from remote URL on Anywhere screen', async () => {
      const demoData =
        '<?xml version="1.0"?><alert><identifier>REMOTE-DEMO</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => demoData,
      })

      mockIsAnywhereScreen.mockReturnValueOnce(true)

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: true,
        feedUrl: '',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(demoData)
      // Should fetch from GitHub remote
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toContain(
        'https://raw.githubusercontent.com/Screenly/Playground',
      )
    })

    it('should return null if demo file not found', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      mockIsAnywhereScreen.mockReturnValueOnce(false)

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: true,
        feedUrl: '',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBeNull()
    })

    it('should not enter demo mode if feed URL is provided', async () => {
      const liveData =
        '<?xml version="1.0"?><alert><identifier>LIVE</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => liveData,
      })

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: true,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(liveData)
      // Should not fetch from static demo files
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).not.toMatch(/^static\/demo-/)
      expect(url).toContain('https://cors-proxy.example.com')
    })
  })

  describe('Live Mode', () => {
    it('should fetch live data with CORS proxy', async () => {
      const liveData =
        '<?xml version="1.0"?><alert><identifier>LIVE</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => liveData,
      })

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(liveData)
      expect(mockFetch.mock.calls[0][0]).toBe(
        'https://cors-proxy.example.com/https://example.com/feed.xml',
      )
    })

    it('should cache successful fetches', async () => {
      const liveData =
        '<?xml version="1.0"?><alert><identifier>CACHED</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => liveData,
      })

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      await fetcher.fetch()

      expect(localStorageMock.getItem('cap_last')).toBe(liveData)
    })

    it('should return cached data on fetch failure', async () => {
      const cachedData =
        '<?xml version="1.0"?><alert><identifier>CACHED</identifier></alert>'

      // Set up cache
      localStorageMock.setItem('cap_last', cachedData)

      // Mock fetch to fail
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(cachedData)
    })

    it('should return null if fetch fails and no cache exists', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBeNull()
    })

    it('should handle HTTP errors', async () => {
      const cachedData =
        '<?xml version="1.0"?><alert><identifier>CACHED</identifier></alert>'

      // Set up cache
      localStorageMock.setItem('cap_last', cachedData)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      // Should return cached data
      expect(result).toBe(cachedData)
    })

    it('should not use CORS proxy for non-HTTP URLs', async () => {
      const liveData =
        '<?xml version="1.0"?><alert><identifier>LOCAL</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => liveData,
      })

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'file:///local/path/feed.xml',
        offlineMode: false,
      })

      await fetcher.fetch()

      // Should not add CORS proxy for non-HTTP URLs
      expect(mockFetch.mock.calls[0][0]).toBe('file:///local/path/feed.xml')
    })
  })

  describe('Offline Mode', () => {
    it('should return cached data in offline mode', async () => {
      const cachedData =
        '<?xml version="1.0"?><alert><identifier>OFFLINE</identifier></alert>'

      // Set up cache
      localStorageMock.setItem('cap_last', cachedData)

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: true,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(cachedData)
      // Should not attempt any fetch
      expect(mockFetch.mock.calls.length).toBe(0)
    })

    it('should return null in offline mode with no cache', async () => {
      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: true,
      })

      const result = await fetcher.fetch()

      expect(result).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle missing feed URL in live mode', async () => {
      const cachedData = '<?xml version="1.0"?><alert></alert>'

      localStorageMock.setItem('cap_last', cachedData)

      const fetcher = new CAPFetcher({
        testMode: false,
        demoMode: false,
        feedUrl: '',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(cachedData)
    })

    it('should prioritize testMode over demoMode', async () => {
      const testData =
        '<?xml version="1.0"?><alert><identifier>TEST</identifier></alert>'

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: async () => testData,
      })

      const fetcher = new CAPFetcher({
        testMode: true,
        demoMode: true,
        feedUrl: 'https://example.com/feed.xml',
        offlineMode: false,
      })

      const result = await fetcher.fetch()

      expect(result).toBe(testData)
      // Should fetch from test file, not demo file
      const url = mockFetch.mock.calls[0][0] as string
      expect(url).toBe('static/test.cap')
    })
  })
})
