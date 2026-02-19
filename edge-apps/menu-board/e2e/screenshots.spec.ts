import { test } from '@playwright/test'
import {
  createMockScreenlyForScreenshots,
  getScreenshotsDir,
  RESOLUTIONS,
  setupScreenlyJsMock,
} from '@screenly/edge-apps/test/screenshots'
import path from 'path'

const { screenlyJsContent } = createMockScreenlyForScreenshots(
  {
    // Screenly Anywhere disables fade animations so items render immediately
    hardware: undefined,
  },
  {
    menu_title: "Today's Menu",
    currency: '$',
    display_errors: 'false',
    item_01_name: 'Classic Margherita',
    item_01_description:
      'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil',
    item_01_price: '13.99',
    item_01_labels: 'vegetarian',
    item_02_name: 'Pepperoni Supreme',
    item_02_description:
      'Double pepperoni, mozzarella, parmesan, homemade tomato sauce, oregano',
    item_02_price: '15.99',
    item_02_labels: 'spicy',
    item_03_name: 'Four Cheese',
    item_03_description:
      'Mozzarella, gorgonzola, parmesan, fontina, fresh basil, garlic olive oil',
    item_03_price: '16.99',
    item_03_labels: 'vegetarian',
    item_04_name: 'Mediterranean Veggie',
    item_04_description:
      'Roasted bell peppers, kalamata olives, red onions, cherry tomatoes, feta, spinach',
    item_04_price: '14.99',
    item_04_labels: 'vegetarian,gluten-free',
  },
)

for (const { width, height } of RESOLUTIONS) {
  test(`screenshot ${width}x${height}`, async ({ browser }) => {
    const screenshotsDir = getScreenshotsDir()

    const context = await browser.newContext({ viewport: { width, height } })
    const page = await context.newPage()

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
