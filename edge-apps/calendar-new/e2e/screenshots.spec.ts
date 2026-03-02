import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  FIXED_SCREENSHOT_DATE,
  getScreenshotsDir,
  RESOLUTIONS,
  setupClockMock,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import path from 'path'

const ICAL_URL = 'https://calendar.example.com/feed.ics'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  { coordinates: [40.7128, -74.006], location: 'New York, NY' },
  {
    bypass_cors: 'false',
    calendar_mode: 'weekly',
    display_errors: 'false',
    ical_url: ICAL_URL,
    override_locale: 'en',
    override_timezone: 'America/New_York',
  },
)

// FIXED_SCREENSHOT_DATE = 2025-02-19T21:20:00Z = 4:20 PM EST (Wed Feb 19, 2025)
// Window: 1 PM – 1 AM (windowStartHour = 13 since currentHour = 16 > 12)
// Week: Sun Feb 16 – Sat Feb 22
const ICS_CONTENT = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Calendar Test//EN
BEGIN:VEVENT
DTSTART:20250219T180000Z
DTEND:20250219T190000Z
SUMMARY:Team Meeting
UID:event-1@test
END:VEVENT
BEGIN:VEVENT
DTSTART:20250219T160000Z
DTEND:20250219T210000Z
SUMMARY:Long Workshop
UID:event-2@test
END:VEVENT
BEGIN:VEVENT
DTSTART:20250219T120000Z
DTEND:20250219T160000Z
SUMMARY:Morning Session (clipped top)
UID:event-3@test
END:VEVENT
BEGIN:VEVENT
DTSTART:20250219T210000Z
DTEND:20250220T030000Z
SUMMARY:Evening Event (clipped bottom)
UID:event-4@test
END:VEVENT
BEGIN:VEVENT
DTSTART:20250217T170000Z
DTEND:20250217T180000Z
SUMMARY:Monday Call
UID:event-5@test
END:VEVENT
BEGIN:VEVENT
DTSTART:20250218T190000Z
DTEND:20250218T200000Z
SUMMARY:Tuesday Review
UID:event-6@test
END:VEVENT
BEGIN:VEVENT
DTSTART:20250219T180000Z
DTEND:20250219T190000Z
SUMMARY:Overlapping Event
UID:event-7@test
END:VEVENT
END:VCALENDAR`

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    await setupClockMock(page, FIXED_SCREENSHOT_DATE)
    await setupScreenlyJsMock(page, screenlyJsContent)

    await page.route(ICAL_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/calendar',
        body: ICS_CONTENT,
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
