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
    enable_analytics: 'true',
    message_body:
      'A simple message app allows users to display text on a screen, making it a basic tool for digital signage. Users can input and edit both the heading and message body directly from the Screenly web console.\n\nWhether used for announcements, reminders, or general information, it provides a straightforward way to communicate with your audience.',
    message_header: 'Simple Message App',
    override_locale: 'en',
    override_timezone: 'America/New_York',
    tag_manager_id: 'GTM-P98SPZ9Z',
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
