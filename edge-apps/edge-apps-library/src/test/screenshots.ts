/**
 * Screenshot testing utilities and constants
 */

import fs from 'fs'
import path from 'path'
import type {
  ScreenlyMetadata,
  ScreenlyObject,
  ScreenlySettings,
} from '../types/index.js'
import { createMockScreenly } from './mock.js'

export { createMockScreenly }

interface PlaywrightRouteFulfillOptions {
  status?: number
  contentType?: string
  body?: string
}

interface PlaywrightRoute {
  fulfill(options: PlaywrightRouteFulfillOptions): Promise<void>
}

/**
 * Standard resolutions for screenshot testing
 * Covers all supported Screenly player resolutions
 */
export const RESOLUTIONS = [
  { width: 4096, height: 2160 },
  { width: 2160, height: 4096 },
  { width: 3840, height: 2160 },
  { width: 2160, height: 3840 },
  { width: 1920, height: 1080 },
  { width: 1080, height: 1920 },
  { width: 1280, height: 720 },
  { width: 720, height: 1280 },
  { width: 800, height: 480 },
  { width: 480, height: 800 },
] as const

/**
 * Returns the screenshots output directory path, creating it if it doesn't exist.
 * Resolves to `<cwd>/screenshots/`.
 */
export function getScreenshotsDir(): string {
  const dir = path.resolve('screenshots')
  fs.mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * Creates the screenly.js content string for Playwright route mocking
 * @param screenlyObject - The Screenly object to inject into window.screenly
 * @returns JavaScript content string for route mocking
 */
export function createScreenlyJsContent(
  screenlyObject: ScreenlyObject,
): string {
  return `
  window.screenly = ${JSON.stringify(screenlyObject, null, 2)};
  window.screenly.signalReadyForRendering = function() {};
`
}

/**
 * Creates a complete mock Screenly object with custom overrides and generates the JS content
 * This is a convenience wrapper that combines createMockScreenly and createScreenlyJsContent
 * @param metadata - Partial metadata overrides
 * @param settings - Partial settings overrides
 * @param corsProxyUrl - Custom CORS proxy URL (defaults to http://127.0.0.1:8080)
 * @returns Object containing both the mock Screenly object and the JS content string
 */
export function createMockScreenlyForScreenshots(
  metadata: Partial<ScreenlyMetadata> = {},
  settings: Partial<ScreenlySettings> = {},
  corsProxyUrl = 'http://127.0.0.1:8080',
): { mockScreenly: ScreenlyObject; screenlyJsContent: string } {
  const mockScreenly = {
    ...createMockScreenly(metadata, settings),
    cors_proxy_url: corsProxyUrl,
  }
  return {
    mockScreenly,
    screenlyJsContent: createScreenlyJsContent(mockScreenly),
  }
}

/**
 * OpenWeather API mock data for Playwright route mocking
 */
export interface OpenWeatherMocks {
  /** Mock data for reverse geocoding endpoint */
  geocoding?: unknown
  /** Mock data for current weather endpoint */
  weather?: unknown
  /** Mock data for forecast endpoint (optional) */
  forecast?: unknown
}

/**
 * Setup OpenWeather API route mocks in Playwright
 * @param page - Playwright page object
 * @param mocks - Mock data for OpenWeather API endpoints
 */
export async function setupOpenWeatherMocks(
  page: {
    route: (
      url: string,
      handler: (route: PlaywrightRoute) => Promise<void>,
    ) => Promise<void>
  },
  mocks: OpenWeatherMocks,
): Promise<void> {
  if (mocks.geocoding) {
    await page.route(
      '**/api.openweathermap.org/geo/1.0/reverse**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mocks.geocoding),
        })
      },
    )
  }

  if (mocks.weather) {
    await page.route(
      '**/api.openweathermap.org/data/2.5/weather**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mocks.weather),
        })
      },
    )
  }

  if (mocks.forecast) {
    await page.route(
      '**/api.openweathermap.org/data/2.5/forecast**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mocks.forecast),
        })
      },
    )
  }
}

/**
 * Setup screenly.js route mock in Playwright
 * @param page - Playwright page object
 * @param screenlyJsContent - JavaScript content string for screenly.js
 */
export async function setupScreenlyJsMock(
  page: {
    route: (
      url: string,
      handler: (route: PlaywrightRoute) => Promise<void>,
    ) => Promise<void>
  },
  screenlyJsContent: string,
): Promise<void> {
  await page.route('/screenly.js?version=1', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: screenlyJsContent,
    })
  })
}
