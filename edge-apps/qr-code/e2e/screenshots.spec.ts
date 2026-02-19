import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  RESOLUTIONS,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import fs from 'fs'
import path from 'path'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  {
    coordinates: [37.7749, -122.4194],
    location: 'San Francisco, CA',
  },
  {
    url: 'https://www.screenly.io/',
    headline: 'Visit our website for exclusive offers',
    call_to_action: 'Scan to visit',
    enable_utm: 'true',
    display_errors: 'false',
  },
)

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = path.resolve('screenshots')
    fs.mkdirSync(screenshotsDir, { recursive: true })

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    // Setup mocks
    await setupScreenlyJsMock(page, screenlyJsContent)

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.screenshot({
      path: path.join(screenshotsDir, `${width}x${height}.png`),
      fullPage: false,
    })

    await context.close()
  })
}
