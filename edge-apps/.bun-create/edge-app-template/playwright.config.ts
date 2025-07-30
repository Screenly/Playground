import { defineConfig, type PlaywrightTestConfig } from '@playwright/test'
import { playwrightConfig } from 'screenly-playground/edge-apps/configs'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig(playwrightConfig as PlaywrightTestConfig)
