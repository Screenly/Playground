import { getCorsProxyUrl, getHardware, Hardware } from '@screenly/edge-apps'

const DEMO_BASE_URL =
  'https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/edge-apps/cap-alerting'

export interface FetcherConfig {
  testMode: boolean
  demoMode: boolean
  feedUrl: string
}

/**
 * Fetches CAP (Common Alerting Protocol) data based on the app mode.
 * Supports test mode (static test file), demo mode (rotating demo files),
 * and production mode (live feed with automatic fallback to cached data).
 * Always works offline using cached data when network is unavailable.
 */
export class CAPFetcher {
  private config: FetcherConfig

  constructor(config: FetcherConfig) {
    this.config = config
  }

  /**
   * Fetch CAP data based on configured mode
   */
  async fetch(): Promise<string | null> {
    if (this.config.testMode) {
      return this.fetchTestData()
    }

    if (this.config.demoMode && !this.config.feedUrl) {
      return this.fetchDemoData()
    }

    return this.fetchLiveData()
  }

  /**
   * Fetch test data from static test file
   */
  private async fetchTestData(): Promise<string | null> {
    try {
      const hardware = getHardware()
      const url =
        hardware === Hardware.Anywhere
          ? `${DEMO_BASE_URL}/static/test.cap`
          : 'static/test.cap'
      const resp = await fetch(url)
      return resp.ok ? await resp.text() : null
    } catch (err) {
      console.warn('Failed to load test data:', err)
      return null
    }
  }

  /**
   * Fetch demo data - randomly selects from available demo files
   */
  private async fetchDemoData(): Promise<string | null> {
    const localDemoFiles = [
      'static/demo-1-tornado.cap',
      'static/demo-2-fire.cap',
      'static/demo-3-flood.cap',
      'static/demo-4-earthquake.cap',
      'static/demo-5-hazmat.cap',
      'static/demo-6-shooter.cap',
    ]

    const remoteDemoFiles = localDemoFiles.map(
      (file) => `${DEMO_BASE_URL}/${file}`,
    )

    const hardware = getHardware()
    const demoFiles =
      hardware === Hardware.Anywhere ? remoteDemoFiles : localDemoFiles
    const randomFile = demoFiles[Math.floor(Math.random() * demoFiles.length)]

    try {
      const resp = await fetch(randomFile)
      return resp.ok ? await resp.text() : null
    } catch (err) {
      console.warn('Failed to load demo data:', err)
      return null
    }
  }

  /**
   * Fetch live CAP data with fallback to localStorage cache
   */
  private async fetchLiveData(): Promise<string | null> {
    // No feed URL configured
    if (!this.config.feedUrl) {
      console.warn('No feed URL configured')
      return localStorage.getItem('cap_last')
    }

    try {
      const cors = getCorsProxyUrl()
      let url = this.config.feedUrl

      // Add CORS proxy for HTTP(S) URLs
      if (this.config.feedUrl.match(/^https?:/)) {
        url = `${cors}/${this.config.feedUrl}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const text = await response.text()
      // Cache the successful fetch
      localStorage.setItem('cap_last', text)
      return text
    } catch (err) {
      console.warn('CAP fetch failed, falling back to cache:', err)
      // Return cached data on failure
      return localStorage.getItem('cap_last')
    }
  }
}
