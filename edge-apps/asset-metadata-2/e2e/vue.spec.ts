import { test } from '@playwright/test'

// See here how to get started:
// https://playwright.dev/docs/intro

/* eslint-disable playwright/expect-expect */
test('basic app structure test', async ({ page }) => {
  await page.goto('/')
})
