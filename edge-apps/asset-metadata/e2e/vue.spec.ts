import { expect, test } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro


test('basic app structure test', async ({ page }) => {
  await page.goto('/')

  // Wait for the app to be ready and fully rendered
  await expect(page.locator('.main-container')).toBeVisible({ timeout: 10000 })

  // Wait for at least one specific card to be rendered (using first() to avoid strict mode violation)
  await expect(page.locator('.primary-card').first()).toBeVisible({ timeout: 10000 })

  // Check for the icon card text elements that contain the labels
  // These come from the iconLabel property in the cards array
  await expect(page.getByText('Host Name')).toBeVisible()
  await expect(page.getByText('Hardware')).toBeVisible()
  await expect(page.getByText('Version')).toBeVisible()
  await expect(page.getByText('Coordinates')).toBeVisible()
  await expect(page.getByText('Labels')).toBeVisible()

  // Also check that the main container structure is present
  await expect(page.locator('.main-container')).toBeVisible()
  await expect(page.locator('.main-container-grid')).toBeVisible()
})
