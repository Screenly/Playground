import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  RESOLUTIONS,
} from '@screenly/edge-apps/test/screenshots'
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
  },
)

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
