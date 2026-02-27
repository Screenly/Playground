import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  getScreenshotsDir,
  RESOLUTIONS,
  setupClockMock,
  setupOpenWeatherMocks,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import { mockGeocodingResponse, mockWeatherResponse } from './weather-mocks'
import path from 'path'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  {
    coordinates: [40.7128, -74.006],
    location: 'New York, NY',
  },
  {
    theme: 'light',
    override_timezone: 'America/New_York',
    override_locale: 'en',
    openweathermap_api_key: 'mock-api-key',
  },
)

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    // Setup mocks
    await setupClockMock(page)
    await setupScreenlyJsMock(page, screenlyJsContent)
    await setupOpenWeatherMocks(page, {
      geocoding: mockGeocodingResponse,
      weather: mockWeatherResponse,
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: path.join(screenshotsDir, `${width}x${height}.png`),
      fullPage: false,
    })

    await context.close()
  })
}
