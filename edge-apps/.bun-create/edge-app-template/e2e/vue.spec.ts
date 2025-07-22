import { expect, test } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro


test('basic app structure test', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Get Started')).toBeVisible()
})
