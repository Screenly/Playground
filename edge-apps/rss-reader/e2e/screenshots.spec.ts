import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  getScreenshotsDir,
  RESOLUTIONS,
  setupClockMock,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import path from 'path'

const RSS_URL = 'http://feeds.bbci.co.uk/news/rss.xml'

const MOCK_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>BBC News</title>
    <link>https://www.bbc.co.uk/news</link>
    <description>BBC News - Home</description>
    <item>
      <title>Global leaders gather for climate summit in Geneva</title>
      <description>World leaders are meeting in Geneva to discuss urgent measures to address climate change, with new emissions targets expected to be announced.</description>
      <pubDate>Mon, 08 Dec 2025 09:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Tech giants face new antitrust regulations across Europe</title>
      <description>The European Commission has unveiled a sweeping set of antitrust measures targeting major technology companies operating within the EU.</description>
      <pubDate>Mon, 08 Dec 2025 08:30:00 GMT</pubDate>
    </item>
    <item>
      <title>Scientists discover new species deep in the Amazon rainforest</title>
      <description>A team of researchers has identified over a dozen previously unknown species during an expedition into a remote region of the Amazon.</description>
      <pubDate>Mon, 08 Dec 2025 07:45:00 GMT</pubDate>
    </item>
    <item>
      <title>Global markets rally as inflation data shows signs of easing</title>
      <description>Stock markets around the world saw significant gains after new data suggested that inflation may be beginning to cool in major economies.</description>
      <pubDate>Mon, 08 Dec 2025 07:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Historic peace agreement signed in the Middle East</title>
      <description>Diplomats have announced a landmark peace agreement following months of negotiations, raising hopes for long-term stability in the region.</description>
      <pubDate>Mon, 08 Dec 2025 06:30:00 GMT</pubDate>
    </item>
    <item>
      <title>Space agency reveals plans for crewed Mars mission by 2035</title>
      <description>A major space agency has outlined an ambitious roadmap for sending astronauts to Mars within the next decade, contingent on funding approvals.</description>
      <pubDate>Mon, 08 Dec 2025 06:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  {
    coordinates: [51.5074, -0.1278],
    location: 'London, UK',
  },
  {
    bypass_cors: 'false',
    cache_interval: '1800',
    display_errors: 'false',
    enable_analytics: 'false',
    override_locale: 'en',
    override_timezone: 'Europe/London',
    rss_title: 'BBC News',
    rss_url: RSS_URL,
  },
)

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

    await setupClockMock(page)
    await setupScreenlyJsMock(page, screenlyJsContent)

    await page.route(RSS_URL, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/rss+xml',
        body: MOCK_RSS_XML,
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
