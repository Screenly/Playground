import { expect, test } from '@playwright/test'

// Extend Window interface to include screenly property
declare global {
  interface Window {
    screenly: {
      signalReadyForRendering: () => void
      metadata: {
        coordinates: [number, number]
        hostname: string
        screen_name: string
        hardware: string
        location: string
        screenly_version: string
        tags: string[]
      }
      settings: {
        theme: string
        screenly_color_accent: string
        screenly_color_light: string
        screenly_color_dark: string
        enable_analytics: string
        tag_manager_id: string
        override_timezone: string
        override_locale: string
      }
      cors_proxy_url: string
    }
  }
}

// See here how to get started:
// https://playwright.dev/docs/intro

test('basic app structure test', async ({ page }) => {
  // Intercept the screenly.js request and provide custom mock data
  await page.route('/screenly.js?version=1', async (route) => {
    const mockScreenlyData = {
      signalReadyForRendering: () => {},
      metadata: {
        coordinates: [40.7128, -74.006],
        hostname: 'test-host',
        screen_name: 'test-screen',
        hardware: 'test-hardware',
        location: 'test-location',
        screenly_version: 'test-version',
        tags: ['tag1', 'tag2', 'tag3'],
      },
      settings: {
        theme: 'light',
        screenly_color_accent: '#972EFF',
        screenly_color_light: '#ADAFBE',
        screenly_color_dark: '#454BD2',
        enable_analytics: 'true',
        tag_manager_id: '',
        override_timezone: 'America/New_York',
        override_locale: 'en',
      },
      cors_proxy_url: 'http://127.0.0.1:8080',
    }

    const screenlyJsContent = `
      // Generated screenly.js for test mode
      window.screenly = {
        signalReadyForRendering: () => {},
        metadata: ${JSON.stringify(mockScreenlyData.metadata, null, 2)},
        settings: ${JSON.stringify(mockScreenlyData.settings, null, 2)},
        cors_proxy_url: ${JSON.stringify(mockScreenlyData.cors_proxy_url)}
      }
    `

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: screenlyJsContent,
    })
  })

  await page.goto('/')

  // Wait for the app to be ready and signal ready for rendering
  await page.waitForFunction(() => {
    return window.screenly && typeof window.screenly.signalReadyForRendering === 'function'
  })

  // Wait for the digital clock to be visible
  await page.locator('.secondary-card-number').waitFor({ timeout: 10000 })

  // Wait for the time to be properly initialized (not 00:00)
  await page.waitForFunction(() => {
    const timeElement = document.querySelector('.secondary-card-number')
    if (!timeElement) return false
    const timeText = timeElement.textContent
    return timeText && timeText !== '00:00' && timeText.includes(':')
  }, { timeout: 10000 })

  // Verify that the time is being displayed correctly
  const timeElement = page.locator('.secondary-card-number')

  await expect(timeElement).toHaveText(/^\d{1,2}:\d{2}$/) // Should match time format like "12:34"
  await expect(timeElement).not.toHaveText('00:00')

  // Verify that AM/PM is displayed if present
  const amPmElement = page.locator('.secondary-card-time-am-pm')
  await expect(amPmElement).toBeVisible()

  // Verify that the clock container is visible
  const clockContainer = page.locator('.secondary-card-number-container')
  await expect(clockContainer).toBeVisible()
})
