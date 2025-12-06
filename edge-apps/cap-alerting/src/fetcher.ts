/**
 * Robust CAP feed fetcher with exponential backoff, caching, and periodic reloading
 */

interface FetcherConfig {
  feedUrl: string
  refreshInterval: number // in seconds, default 30
  maxRetries: number // default 5
  initialRetryDelay: number // in ms, default 1000
  maxRetryDelay: number // in ms, default 30000
  corsProxyUrl: string
}

interface CacheEntry {
  data: string
  timestamp: number
  isValid: boolean
}

const CACHE_KEY = 'cap_feed_cache'
const CACHE_METADATA_KEY = 'cap_feed_cache_meta'

export class CAPFetcher {
  private config: FetcherConfig
  private intervalId: number | null = null
  private isRunning: boolean = false
  private lastSuccessfulFetch: number = 0
  private consecutiveFailures: number = 0

  constructor(config: Partial<FetcherConfig>) {
    this.config = {
      feedUrl: config.feedUrl || '',
      refreshInterval: config.refreshInterval || 30,
      maxRetries: config.maxRetries || 5,
      initialRetryDelay: config.initialRetryDelay || 1000,
      maxRetryDelay: config.maxRetryDelay || 30000,
      corsProxyUrl: config.corsProxyUrl || '',
    }
  }

  /**
   * Start the periodic fetching
   */
  public start(onUpdate: (data: string | null) => void): void {
    if (this.isRunning) {
      console.warn('CAPFetcher is already running')
      return
    }

    this.isRunning = true

    // Initial fetch
    this.fetchWithRetry().then((data) => {
      if (data) {
        onUpdate(data)
      } else {
        // If initial fetch fails, try to load from cache
        const cached = this.getCachedData()
        if (cached) {
          console.log('Using cached data for initial load')
          onUpdate(cached)
        } else {
          onUpdate(null)
        }
      }
    })

    // Set up periodic fetching
    this.intervalId = window.setInterval(() => {
      this.fetchWithRetry().then((data) => {
        if (data) {
          onUpdate(data)
        }
        // If fetch fails, we keep displaying the cached data without calling onUpdate
      })
    }, this.config.refreshInterval * 1000)
  }

  /**
   * Stop the periodic fetching
   */
  public stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
  }

  /**
   * Get cached data from localStorage
   */
  private getCachedData(): string | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const meta = this.getCacheMetadata()
      if (!meta || !meta.isValid) {
        console.warn('Cache metadata indicates invalid data')
        return null
      }

      return cached
    } catch (err) {
      console.error('Error reading from cache:', err)
      return null
    }
  }

  /**
   * Get cache metadata
   */
  private getCacheMetadata(): CacheEntry | null {
    try {
      const metaStr = localStorage.getItem(CACHE_METADATA_KEY)
      if (!metaStr) return null
      return JSON.parse(metaStr) as CacheEntry
    } catch (err) {
      console.error('Error reading cache metadata:', err)
      return null
    }
  }

  /**
   * Save data to cache with validation
   */
  private saveToCacheWithValidation(data: string): boolean {
    try {
      // Validate the data before saving
      if (!data || data.trim().length === 0) {
        console.warn('Refusing to cache empty data')
        return false
      }

      // Basic XML validation - check if it looks like valid CAP XML
      if (!data.includes('<alert') && !data.includes('<?xml')) {
        console.warn('Data does not appear to be valid CAP XML')
        return false
      }

      // Create a temporary storage key to avoid corrupting existing cache
      const tempKey = `${CACHE_KEY}_temp`
      const tempMetaKey = `${CACHE_METADATA_KEY}_temp`

      // Write to temporary keys first
      localStorage.setItem(tempKey, data)
      const metadata: CacheEntry = {
        data: '', // We don't store data in metadata, just reference
        timestamp: Date.now(),
        isValid: true,
      }
      localStorage.setItem(tempMetaKey, JSON.stringify(metadata))

      // Verify the write was successful
      const verification = localStorage.getItem(tempKey)
      if (verification !== data) {
        console.error('Cache verification failed')
        localStorage.removeItem(tempKey)
        localStorage.removeItem(tempMetaKey)
        return false
      }

      // Now atomically move temp to actual cache
      localStorage.setItem(CACHE_KEY, data)
      localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata))

      // Clean up temp keys
      localStorage.removeItem(tempKey)
      localStorage.removeItem(tempMetaKey)

      console.log('Successfully cached data')
      this.lastSuccessfulFetch = Date.now()
      this.consecutiveFailures = 0

      return true
    } catch (err) {
      console.error('Error saving to cache:', err)
      return false
    }
  }

  /**
   * Mark cache as invalid without removing it (for fallback purposes)
   */
  private markCacheAsInvalid(): void {
    try {
      const meta = this.getCacheMetadata()
      if (meta) {
        meta.isValid = false
        localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(meta))
      }
    } catch (err) {
      console.error('Error marking cache as invalid:', err)
    }
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  private async fetchWithRetry(): Promise<string | null> {
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const data = await this.fetchData()
        
        if (data) {
          // Successfully fetched - save to cache
          const saved = this.saveToCacheWithValidation(data)
          if (saved) {
            return data
          } else {
            console.warn('Failed to cache data, but returning it anyway')
            return data
          }
        }
      } catch (err) {
        console.error(`Fetch attempt ${attempt + 1} failed:`, err)
        this.consecutiveFailures++

        // If this isn't the last attempt, wait before retrying
        if (attempt < this.config.maxRetries - 1) {
          const delay = this.calculateBackoffDelay(attempt)
          console.log(`Retrying in ${delay}ms...`)
          await this.sleep(delay)
        }
      }
    }

    // All retries exhausted
    console.error(`Failed to fetch after ${this.config.maxRetries} attempts`)
    
    // Return cached data as fallback
    const cached = this.getCachedData()
    if (cached) {
      console.log('Falling back to cached data')
      return cached
    }

    return null
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.config.initialRetryDelay * Math.pow(2, attempt),
      this.config.maxRetryDelay
    )
    
    // Add jitter (±25% randomness) to prevent thundering herd
    const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1)
    return Math.floor(exponentialDelay + jitter)
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Perform the actual fetch
   */
  private async fetchData(): Promise<string | null> {
    if (!this.config.feedUrl) {
      throw new Error('Feed URL is not configured')
    }

    let url = this.config.feedUrl

    // Add CORS proxy if needed
    if (this.config.feedUrl.match(/^https?:/)) {
      url = `${this.config.corsProxyUrl}/${this.config.feedUrl}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'application/xml, text/xml, */*',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()

      if (!text || text.trim().length === 0) {
        throw new Error('Received empty response')
      }

      return text
    } catch (err) {
      clearTimeout(timeoutId)
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new Error('Fetch timeout after 15 seconds')
        }
        throw err
      }
      
      throw new Error('Unknown fetch error')
    }
  }

  /**
   * Get statistics about the fetcher's performance
   */
  public getStats() {
    return {
      isRunning: this.isRunning,
      lastSuccessfulFetch: this.lastSuccessfulFetch,
      consecutiveFailures: this.consecutiveFailures,
      cacheAge: this.getCacheAge(),
    }
  }

  /**
   * Get cache age in seconds
   */
  private getCacheAge(): number | null {
    const meta = this.getCacheMetadata()
    if (!meta) return null
    return Math.floor((Date.now() - meta.timestamp) / 1000)
  }

  /**
   * Force a refresh (useful for debugging)
   */
  public async forceRefresh(onUpdate: (data: string | null) => void): Promise<void> {
    const data = await this.fetchWithRetry()
    if (data) {
      onUpdate(data)
    }
  }
}

