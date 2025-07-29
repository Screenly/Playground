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
        greeting: 'World',
        secretWord: 'test-secret',
        screenly_color_accent: '#000000',
        screenly_color_light: '#000000',
        screenly_color_dark: '#000000',
        enable_analytics: 'true',
        tag_manager_id: '',
        theme: 'light',
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

  // Check for greeting and secret word
  await expect(page.getByText('Greetings, World!')).toBeVisible()
  await expect(page.getByText('You secret word is')).toBeVisible()
  await expect(page.getByText('test-secret')).toBeVisible()

  // Check for screen information
  await expect(page.getByText('test-screen')).toBeVisible()
  await expect(page.getByText('test-location')).toBeVisible()
  await expect(page.getByText('40.7128°')).toBeVisible()
  await expect(page.getByText('-74.006°')).toBeVisible()

  // Check for hardware and hostname
  await expect(page.getByText('test-host')).toBeVisible()
  await expect(page.getByText('test-hardware')).toBeVisible()

  // Check for specific text content
  await expect(page.getByText("I'm test-screen")).toBeVisible()
  await expect(page.getByText('My Screenly ID is')).toBeVisible()
  await expect(page.getByText('which conveniently is also my hostname')).toBeVisible()
  await expect(page.getByText("and I'm running on a")).toBeVisible()
})
