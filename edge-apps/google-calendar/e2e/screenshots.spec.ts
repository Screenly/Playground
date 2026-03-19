import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  FIXED_SCREENSHOT_DATE,
  getScreenshotsDir,
  RESOLUTIONS,
  setupClockMock,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const LOGO_DATA_URL = `data:image/svg+xml;base64,${Buffer.from(
  fs.readFileSync(path.join(__dirname, 'screenly.svg'), 'utf-8'),
).toString('base64')}`

// FIXED_SCREENSHOT_DATE = 2025-02-19T21:20:00Z = 4:20 PM EST (Wed Feb 19, 2025)
// Window: 1 PM – 1 AM (windowStartHour = 13 since currentHour = 16 > 12)
// Week: Sun Feb 16 – Sat Feb 22

// Events in UTC — rendered in America/New_York (UTC-5 in February):
//   20250219T160000Z = 11:00 AM EST  (before window)
//   20250219T180000Z = 1:00 PM EST   (window start)
//   20250219T190000Z = 2:00 PM EST   (Long Workshop start)
//   20250219T210000Z = 4:00 PM EST   (now ≈ 4:20 PM)
//   20250219T220000Z = 5:00 PM EST   (Evening Event)
//   20250220T030000Z = 10:00 PM EST  (Evening Event ends, past midnight UTC)
//   20250220T140000Z = 9:00 AM EST tomorrow
//   20250217T170000Z = 12:00 PM EST Monday
//   20250218T190000Z = 2:00 PM EST Tuesday
const GOOGLE_EVENTS_RESPONSE = {
  kind: 'calendar#events',
  items: [
    {
      summary: 'Team Meeting',
      start: { dateTime: '2025-02-21T20:00:00Z' },
      end: { dateTime: '2025-02-21T21:30:00Z' },
      colorId: '1',
    },
    {
      summary: 'Long Workshop',
      start: { dateTime: '2025-02-19T19:00:00Z' },
      end: { dateTime: '2025-02-19T21:00:00Z' },
      colorId: '2',
    },
    {
      summary: 'Morning Session',
      start: { dateTime: '2025-02-19T16:00:00Z' },
      end: { dateTime: '2025-02-19T19:00:00Z' },
      colorId: '3',
    },
    {
      summary: 'Evening Event',
      start: { dateTime: '2025-02-19T22:00:00Z' },
      end: { dateTime: '2025-02-20T03:00:00Z' },
      colorId: '4',
    },
    {
      summary: 'Design Review',
      start: { dateTime: '2025-02-19T21:30:00Z' },
      end: { dateTime: '2025-02-19T22:30:00Z' },
      colorId: '5',
    },
    {
      summary: 'Client Call',
      start: { dateTime: '2025-02-19T23:00:00Z' },
      end: { dateTime: '2025-02-20T00:00:00Z' },
      colorId: '6',
    },
    {
      summary: 'Late Sync',
      start: { dateTime: '2025-02-20T00:00:00Z' },
      end: { dateTime: '2025-02-20T01:00:00Z' },
      colorId: '7',
    },
    {
      summary: 'Monday Call',
      start: { dateTime: '2025-02-17T17:00:00Z' },
      end: { dateTime: '2025-02-17T18:00:00Z' },
      colorId: '1',
    },
    {
      summary: 'Tuesday Review',
      start: { dateTime: '2025-02-18T19:00:00Z' },
      end: { dateTime: '2025-02-18T20:00:00Z' },
      colorId: '2',
    },
    {
      summary: 'Overlapping Event',
      start: { dateTime: '2025-02-21T21:00:00Z' },
      end: { dateTime: '2025-02-21T22:00:00Z' },
      colorId: '3',
    },
    {
      summary: 'Tomorrow Standup',
      start: { dateTime: '2025-02-20T14:00:00Z' },
      end: { dateTime: '2025-02-20T15:00:00Z' },
      colorId: '4',
    },
    {
      summary: 'Product Demo',
      start: { dateTime: '2025-02-20T16:30:00Z' },
      end: { dateTime: '2025-02-20T17:30:00Z' },
      colorId: '5',
    },
    {
      summary: 'Tomorrow Review',
      start: { dateTime: '2025-02-20T19:00:00Z' },
      end: { dateTime: '2025-02-20T20:00:00Z' },
      colorId: '6',
    },
    {
      summary: 'Team Sync',
      start: { dateTime: '2025-02-20T20:00:00Z' },
      end: { dateTime: '2025-02-20T21:00:00Z' },
      colorId: '7',
    },
    {
      summary: '1:1 with Manager',
      start: { dateTime: '2025-02-20T21:30:00Z' },
      end: { dateTime: '2025-02-20T22:30:00Z' },
      colorId: '1',
    },
  ],
}

const GOOGLE_COLORS_RESPONSE = {
  kind: 'calendar#colors',
  updated: '2012-02-14T00:00:00.000Z',
  event: {
    '1': { background: '#a4bdfc', foreground: '#1d1d1d' },
    '2': { background: '#7ae7bf', foreground: '#1d1d1d' },
    '3': { background: '#dbadff', foreground: '#1d1d1d' },
    '4': { background: '#ff887c', foreground: '#1d1d1d' },
    '5': { background: '#fbd75b', foreground: '#1d1d1d' },
    '6': { background: '#ffb878', foreground: '#1d1d1d' },
    '7': { background: '#46d6db', foreground: '#1d1d1d' },
  },
}

const CALENDAR_MODES = ['schedule', 'weekly', 'daily'] as const

for (const mode of CALENDAR_MODES) {
  const { screenlyJsContent } = createMockScreenlyForScreenshots(
    { coordinates: [40.7128, -74.006], location: 'New York, NY' },
    {
      access_token: 'mock-access-token',
      calendar_id: 'primary',
      calendar_mode: mode,
      display_errors: 'false',
      override_locale: 'en',
      override_timezone: 'America/New_York',
      screenly_color_accent: '#2E8B57',
      screenly_logo_light: LOGO_DATA_URL,
    },
  )

  for (const { width, height } of RESOLUTIONS) {
    test(`screenshot ${mode} ${width}x${height}`, async ({ browser }) => {
      const screenshotsDir = getScreenshotsDir()

      const context = await browser.newContext({ viewport: { width, height } })
      const page = await context.newPage()

      await setupClockMock(page, FIXED_SCREENSHOT_DATE)
      await setupScreenlyJsMock(page, screenlyJsContent)

      await page.route(/googleapis\.com\/calendar\/v3\/calendars\//, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(GOOGLE_EVENTS_RESPONSE),
        })
      })

      await page.route(/googleapis\.com\/calendar\/v3\/colors/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(GOOGLE_COLORS_RESPONSE),
        })
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      await page.screenshot({
        path: path.join(screenshotsDir, `${mode}-${width}x${height}.png`),
        fullPage: false,
      })

      await context.close()
    })
  }
}
