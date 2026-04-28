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
import { PHOTO_1, PHOTO_2, PHOTO_3, PHOTO_4, PHOTO_5 } from './photos'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  { coordinates: [37.3861, -122.0839], location: 'Silicon Valley, USA' },
  {
    api_key: 'mock-api-key',
    subdomain: 'acme',
    override_locale: 'en',
    override_timezone: 'America/New_York',
  },
)

// FIXED_SCREENSHOT_DATE = 2025-02-19T21:20:00Z = Feb 19, 2025 (UTC)
// Dates chosen so employees appear in all three sections at max capacity (5 each)
const EMPLOYEES_RESPONSE = {
  data: [
    {
      eeid: '101',
      firstName: 'Jane',
      lastName: 'Smith',
      dateOfBirth: '1990-02-19',
      hireDate: '2018-02-19',
      employeePhoto: PHOTO_1,
    },
    {
      eeid: '102',
      firstName: 'Alexander',
      lastName: 'Johnson',
      dateOfBirth: '1985-02-20',
      hireDate: '2015-02-20',
      employeePhoto: PHOTO_2,
    },
    {
      eeid: '103',
      firstName: 'Mary',
      lastName: 'Williams',
      dateOfBirth: '1992-02-19',
      hireDate: '2020-02-19',
      employeePhoto: PHOTO_3,
    },
    {
      eeid: '104',
      firstName: 'Robert',
      lastName: 'Brown',
      dateOfBirth: '1988-02-20',
      hireDate: '2019-02-20',
      employeePhoto: PHOTO_4,
    },
    {
      eeid: '105',
      firstName: 'Emily',
      lastName: 'Davis',
      dateOfBirth: '1995-02-19',
      hireDate: '2022-02-19',
      employeePhoto: PHOTO_5,
    },
  ],
}

const WHOS_OUT_RESPONSE = [
  {
    id: 1,
    employeeId: 101,
    name: 'Jane Smith',
    start: '2025-02-18',
    end: '2025-02-21',
    type: 'vacation',
  },
  {
    id: 2,
    employeeId: 102,
    name: 'Alexander Johnson',
    start: '2025-02-19',
    end: '2025-02-19',
    type: 'sick',
  },
  {
    id: 3,
    employeeId: 103,
    name: 'Mary Williams',
    start: '2025-02-19',
    end: '2025-02-20',
    type: 'vacation',
  },
  {
    id: 4,
    employeeId: 104,
    name: 'Robert Brown',
    start: '2025-02-17',
    end: '2025-02-22',
    type: 'sick',
  },
  {
    id: 5,
    employeeId: 105,
    name: 'Emily Davis',
    start: '2025-02-19',
    end: '2025-02-19',
    type: 'vacation',
  },
]

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    await setupClockMock(page, FIXED_SCREENSHOT_DATE)
    await setupScreenlyJsMock(page, screenlyJsContent)

    await page.route(/bamboohr\.com\/api\/v1\/datasets\/employee/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(EMPLOYEES_RESPONSE),
      })
    })

    await page.route(/bamboohr\.com\/api\/v1\/time_off\/whos_out/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(WHOS_OUT_RESPONSE),
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
