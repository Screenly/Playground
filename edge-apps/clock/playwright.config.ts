import process from 'node:process'
import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test'
import getPlaywrightConfig from '../blueprint/ts/configs/playwright'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const baseConfig = getPlaywrightConfig(process, devices) as PlaywrightTestConfig
export default defineConfig(baseConfig)
