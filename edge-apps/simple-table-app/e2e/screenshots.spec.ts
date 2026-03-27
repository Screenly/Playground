import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  getScreenshotsDir,
  RESOLUTIONS,
  setupClockMock,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import path from 'path'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  { coordinates: [40.7128, -74.006], location: 'New York, NY' },
  {
    content:
      'Name,Department,Location,Years\nAlice Johnson,Engineering,New York,5\nBob Smith,Marketing,Los Angeles,3\nCarol White,Design,Chicago,7\nDavid Lee,Engineering,San Francisco,2\nEva Brown,Product,Seattle,4',
    override_timezone: 'America/New_York',
    title: 'Team Directory',
  },
)

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    await setupClockMock(page)
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
