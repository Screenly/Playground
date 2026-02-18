/**
 * Screenshot testing utilities and constants
 */

import type {
  ScreenlyMetadata,
  ScreenlyObject,
  ScreenlySettings,
} from '../types/index.js'
import { createMockScreenly } from './mock.js'

export { createMockScreenly }

/**
 * Standard resolutions for screenshot testing
 * Covers all supported Screenly player resolutions
 */
export const RESOLUTIONS = [
  { width: 4096, height: 2160 },
  { width: 2160, height: 4096 },
  { width: 3840, height: 2160 },
  { width: 2160, height: 3840 },
  { width: 1920, height: 1080 },
  { width: 1080, height: 1920 },
  { width: 1280, height: 720 },
  { width: 720, height: 1280 },
  { width: 800, height: 480 },
  { width: 480, height: 800 },
] as const

/**
 * Creates the screenly.js content string for Playwright route mocking
 * @param screenlyObject - The Screenly object to inject into window.screenly
 * @returns JavaScript content string for route mocking
 */
export function createScreenlyJsContent(
  screenlyObject: ScreenlyObject,
): string {
  return `
  window.screenly = ${JSON.stringify(screenlyObject, null, 2)};
  window.screenly.signalReadyForRendering = function() {};
`
}

/**
 * Creates a complete mock Screenly object with custom overrides and generates the JS content
 * This is a convenience wrapper that combines createMockScreenly and createScreenlyJsContent
 * @param metadata - Partial metadata overrides
 * @param settings - Partial settings overrides
 * @param corsProxyUrl - Custom CORS proxy URL (defaults to http://127.0.0.1:8080)
 * @returns Object containing both the mock Screenly object and the JS content string
 */
export function createMockScreenlyForScreenshots(
  metadata: Partial<ScreenlyMetadata> = {},
  settings: Partial<ScreenlySettings> = {},
  corsProxyUrl = 'http://127.0.0.1:8080',
): { mockScreenly: ScreenlyObject; screenlyJsContent: string } {
  const mockScreenly = {
    ...createMockScreenly(metadata, settings),
    cors_proxy_url: corsProxyUrl,
  }
  return {
    mockScreenly,
    screenlyJsContent: createScreenlyJsContent(mockScreenly),
  }
}
