import { expect, test } from '@playwright/test'

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
        bypass_cors: false,
        calendar_mode: 'daily',
        ical_url: 'https://example.com',
        override_locale: '',
        override_timezone: '',
        screenly_color_accent: '#000000',
        screenly_color_dark: '#000000',
        screenly_color_light: '#000000',
        sentry_dsn: '',
      },
      cors_proxy_url: 'https://example.com',
    }

    const screenlyJsContent = `
      // Generated screenly.js for test mode
      window.screenly = ${JSON.stringify(mockScreenlyData, null, 2)}
    `

    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: screenlyJsContent,
    })
  })

  await page.goto('/')

  // Check for "Powered by Screenly" text
  await expect(page.getByText('Powered by Screenly')).toBeVisible()

  // Check for calendar app structure
  await expect(page.locator('.main-container')).toBeVisible()
  await expect(page.locator('.secondary-container')).toBeVisible()
})
