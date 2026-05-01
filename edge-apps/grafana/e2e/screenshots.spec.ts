import { test, type Browser, type Route } from '@playwright/test'
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

const { screenlyJsContent: screenlyJsContentWithErrors } =
  createMockScreenlyForScreenshots(
    {},
    {
      dashboard_id: DASHBOARD_ID,
      refresh_interval: '3600',
      display_errors: 'true',
      screenly_oauth_tokens_url: 'http://127.0.0.1:8080/oauth/',
    },
  )

const dashboardImage = fs.readFileSync(
  path.resolve('e2e/fixtures/sample-grafana-dashboard.png'),
)

const DISPLAY_ERRORS_RESOLUTIONS = [
  { width: 1920, height: 1080 },
  { width: 1080, height: 1920 },
]

async function runScreenshotTest(
  browser: Browser,
  width: number,
  height: number,
  screenlyContent: string,
  filename: string,
  mockRenderRoute: (route: Route) => Promise<void>,
) {
  const screenshotsDir = getScreenshotsDir()
  const context = await browser.newContext({ viewport: { width, height } })
  const page = await context.newPage()

  await setupClockMock(page)
  await setupScreenlyJsMock(page, screenlyContent)

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

  await page.route('**/render/d/**', mockRenderRoute)

  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.screenshot({
    path: path.join(screenshotsDir, filename),
    fullPage: false,
  })

  await context.close()
}

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    await runScreenshotTest(
      browser,
      width,
      height,
      screenlyJsContent,
      `${width}x${height}.png`,
      async (route) =>
        route.fulfill({
          status: 200,
          contentType: 'image/png',
          body: dashboardImage,
        }),
    )
  })
}

for (const { width, height } of DISPLAY_ERRORS_RESOLUTIONS) {
  test(`screenshot ${width}x${height} display-errors`, async ({ browser }) => {
    await runScreenshotTest(
      browser,
      width,
      height,
      screenlyJsContentWithErrors,
      `${width}x${height}-display-errors.png`,
      async (route) =>
        route.fulfill({
          status: 403,
          contentType: 'text/plain',
          body: 'Access to this Grafana dashboard is forbidden.',
        }),
    )
  })
}
