import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  getScreenshotsDir,
  RESOLUTIONS,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import fs from 'fs'
import path from 'path'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  {
    tags: ['exit:North Lobby'],
  },
  {
    cap_feed_url: '',
    display_errors: 'false',
    language: 'en',
    mode: 'demo',
  },
)

const capXml = fs.readFileSync(
  path.resolve('static/demo-2-fire.cap'),
  'utf-8',
)

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    await setupScreenlyJsMock(page, screenlyJsContent)

    // Mock all demo CAP file requests to avoid network dependency
    await page.route('**/static/demo-*.cap', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/xml',
        body: capXml,
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
