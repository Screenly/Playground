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

  // Wait for the app to be ready and fully rendered
  await expect(page.locator('.main-container')).toBeVisible({ timeout: 10000 })

  // Wait for at least one specific card to be rendered (using first() to avoid strict mode violation)
  await expect(page.locator('.primary-card').first()).toBeVisible({ timeout: 10000 })

  // Check for the icon card text elements that contain the labels
  // These come from the iconLabel property in the cards array
  // Use more specific selectors to avoid strict mode violations
  await expect(page.locator('.icon-card-text.head-text').filter({ hasText: 'Host Name' })).toBeVisible()
  await expect(page.locator('.icon-card-text.head-text').filter({ hasText: 'Hardware' })).toBeVisible()
  await expect(page.locator('.icon-card-text.head-text').filter({ hasText: 'Version' })).toBeVisible()
  await expect(page.locator('.icon-card-text.head-text').filter({ hasText: 'Coordinates' })).toBeVisible()
  await expect(page.locator('.icon-card-text.head-text').filter({ hasText: 'Labels' })).toBeVisible()

  // Also check that the main container structure is present
  await expect(page.locator('.main-container')).toBeVisible()
  await expect(page.locator('.main-container-grid')).toBeVisible()
})
