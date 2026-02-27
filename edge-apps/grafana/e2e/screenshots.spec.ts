import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  getScreenshotsDir,
  RESOLUTIONS,
  setupClockMock,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import fs from 'fs'
import path from 'path'

const GRAFANA_DOMAIN = 'grafana.example.com'
const DASHBOARD_ID = 'test-dashboard-id'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  {},
  {
    dashboard_id: DASHBOARD_ID,
    refresh_interval: '3600',
    display_errors: 'false',
    screenly_oauth_tokens_url: 'http://127.0.0.1:8080/oauth/',
  },
)

const dashboardImage = fs.readFileSync(
  path.resolve('e2e/fixtures/sample-grafana-dashboard.png'),
)

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    await setupClockMock(page)
    await setupScreenlyJsMock(page, screenlyJsContent)

    // Mock OAuth token endpoint
    await page.route('**/oauth/access_token/', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-service-access-token',
          metadata: { domain: GRAFANA_DOMAIN },
        }),
      })
    })

    // Mock Grafana render endpoint
    await page.route('**/render/d/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: dashboardImage,
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
