import { test } from '@playwright/test'
import { RESOLUTIONS } from '@screenly/edge-apps/test/screenshots'
import fs from 'fs'
import path from 'path'

const mockScreenlyData = {
  metadata: {
    coordinates: [40.7128, -74.006],
    hostname: 'test-host',
    screen_name: 'Test Screen',
    hardware: 'test-hardware',
    location: 'New York, NY',
    screenly_version: 'test-version',
    tags: [],
  },
  settings: {
    theme: 'light',
    override_timezone: 'America/New_York',
    override_locale: 'en',
    screenly_color_accent: '#972EFF',
    screenly_color_light: '#ADAFBE',
    screenly_color_dark: '#454BD2',
    screenly_logo_light: '',
    screenly_logo_dark: '',
  },
  cors_proxy_url: 'http://127.0.0.1:8080',
}

const screenlyJsContent = `
  window.screenly = ${JSON.stringify(mockScreenlyData, null, 2)};
  window.screenly.signalReadyForRendering = function() {};
`

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = path.resolve('screenshots')
    fs.mkdirSync(screenshotsDir, { recursive: true })

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    await page.route('/screenly.js?version=1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: screenlyJsContent,
      })
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
