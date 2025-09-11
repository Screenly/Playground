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
        api_key: 'test-api-key',
        screenly_color_accent: '#972EFF',
        screenly_color_light: '#ADAFBE',
        screenly_color_dark: '#454BD2',
        enable_analytics: 'true',
        override_locale: 'en',
        override_timezone: 'UTC',
        sentry_dsn: '',
        tag_manager_id: '',
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

  // Check for dashboard title
  await expect(page.getByText('BambooHR Dashboard')).toBeVisible()
  await expect(page.getByText('Powered by Screenly')).toBeVisible()

  // Check for dashboard sections
  await expect(page.getByText('On Leave Today')).toBeVisible()
  await expect(page.getByText('No upcoming birthdays')).toBeVisible()
  await expect(page.getByText('No upcoming anniversaries')).toBeVisible()
})
