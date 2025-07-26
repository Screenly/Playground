import { expect, test } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro

 
test('basic app structure test', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Host Name')).toBeVisible()
  await expect(page.getByText('Hardware')).toBeVisible()
  await expect(page.getByText('Version')).toBeVisible()
  await expect(page.getByText('Coordinates')).toBeVisible()
  await expect(page.getByText('Labels')).toBeVisible()
})
