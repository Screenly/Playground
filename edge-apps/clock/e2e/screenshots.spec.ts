import { test } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const RESOLUTIONS = [
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
]

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
  cors_proxy_url: 'https://example.com',
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
