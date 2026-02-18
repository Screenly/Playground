import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  RESOLUTIONS,
} from '@screenly/edge-apps/test/screenshots'
import { mockGeocodingResponse, mockWeatherResponse } from './weather-mocks'
import fs from 'fs'
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
    const screenshotsDir = path.resolve('screenshots')
    fs.mkdirSync(screenshotsDir, { recursive: true })

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    // Mock screenly.js
    await page.route('/screenly.js?version=1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: screenlyJsContent,
      })
    })

    // Mock OpenWeather reverse geocoding API
    await page.route(
      '**/api.openweathermap.org/geo/1.0/reverse**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockGeocodingResponse),
        })
      },
    )

    // Mock OpenWeather current weather API
    await page.route(
      '**/api.openweathermap.org/data/2.5/weather**',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockWeatherResponse),
        })
      },
    )

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: path.join(screenshotsDir, `${width}x${height}.png`),
      fullPage: false,
    })

    await context.close()
  })
}
