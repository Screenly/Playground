import { expect, test } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro

test('basic app structure test', async ({ page }) => {
  // Intercept the screenly.js request and provide custom mock data
  await page.route('/screenly.js?version=1', async (route) => {
    const mockScreenlyData = {
      signalReadyForRendering: () => {},
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

  // Check for app title
  await expect(page.getByText('BambooHR App')).toBeVisible()
})
