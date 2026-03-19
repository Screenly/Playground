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
// Week: Sun Feb 16 – Sat Feb 22
// Microsoft Graph returns dateTime in the event's local timeZone using Windows timezone names.
// dayjs.tz() requires IANA timezone names, so events.ts must convert them — but for the
// mock response we use IANA names directly since our events.ts passes the timeZone straight
// to dayjs.tz(). The actual Graph API returns Windows names like 'Eastern Standard Time',
// but dayjs does not recognize those. The mock uses IANA equivalents to match what our
// parser expects.
const MICROSOFT_EVENTS_RESPONSE = {
  value: [
    {
      subject: 'Team Meeting',
      isAllDay: false,
      start: { dateTime: '2025-02-21T15:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-21T16:30:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Long Workshop',
      isAllDay: false,
      start: { dateTime: '2025-02-19T14:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-19T16:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Morning Session',
      isAllDay: false,
      start: { dateTime: '2025-02-19T11:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-19T14:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Evening Event',
      isAllDay: false,
      start: { dateTime: '2025-02-19T17:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-19T22:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Design Review',
      isAllDay: false,
      start: { dateTime: '2025-02-19T16:30:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-19T17:30:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Client Call',
      isAllDay: false,
      start: { dateTime: '2025-02-19T18:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-19T19:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Late Sync',
      isAllDay: false,
      start: { dateTime: '2025-02-19T19:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-19T20:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Monday Call',
      isAllDay: false,
      start: { dateTime: '2025-02-17T12:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-17T13:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Tuesday Review',
      isAllDay: false,
      start: { dateTime: '2025-02-18T14:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-18T15:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Overlapping Event',
      isAllDay: false,
      start: { dateTime: '2025-02-21T16:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-21T17:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Tomorrow Standup',
      isAllDay: false,
      start: { dateTime: '2025-02-20T09:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-20T10:00:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'Product Demo',
      isAllDay: false,
      start: { dateTime: '2025-02-20T11:30:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-20T12:30:00', timeZone: 'America/New_York' },
    },
    {
      subject: 'All-Day Event',
      isAllDay: true,
      start: { dateTime: '2025-02-20T00:00:00', timeZone: 'America/New_York' },
      end: { dateTime: '2025-02-21T00:00:00', timeZone: 'America/New_York' },
    },
  ],
}

const CALENDAR_MODES = ['schedule', 'weekly', 'daily'] as const

for (const mode of CALENDAR_MODES) {
  const { screenlyJsContent } = createMockScreenlyForScreenshots(
    { coordinates: [40.7128, -74.006], location: 'New York, NY' },
    {
      access_token: 'mock-access-token',
      calendar_id: '',
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

      await page.route(/graph\.microsoft\.com\/v1\.0\/me\/calendarview/, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MICROSOFT_EVENTS_RESPONSE),
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
