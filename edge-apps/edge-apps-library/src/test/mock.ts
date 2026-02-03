import type {
  ScreenlyObject,
  ScreenlyMetadata,
  ScreenlySettings,
} from '../types/index.js'

const global = globalThis as Record<string, unknown>

/**
 * Default mock metadata for testing
 */
export const mockMetadata: ScreenlyMetadata = {
  coordinates: [37.3861, -122.0839] as [number, number],
  hostname: 'test-hostname',
  location: 'Test Location',
  hardware: 'test-hardware',
  screenly_version: '1.0.0-test',
  screen_name: 'Test Screen',
  tags: ['test', 'development'],
}

/**
 * Default mock settings for testing
 */
export const mockSettings: ScreenlySettings = {
  screenly_color_accent: '#972EFF',
  screenly_color_light: '#ADAFBE',
  screenly_color_dark: '#454BD2',
  screenly_logo_light: '',
  screenly_logo_dark: '',
}

/**
 * Create a mock Screenly object for testing
 */
export function createMockScreenly(
  metadata: Partial<ScreenlyMetadata> = {},
  settings: Partial<ScreenlySettings> = {},
  corsProxyUrl = 'http://localhost:8080',
): ScreenlyObject {
  return {
    signalReadyForRendering: () => {},
    metadata: { ...mockMetadata, ...metadata },
    settings: { ...mockSettings, ...settings },
    cors_proxy_url: corsProxyUrl,
  }
}

/**
 * Setup global screenly mock for testing
 * Call this in your test setup to mock the global screenly object
 */
export function setupScreenlyMock(
  metadata: Partial<ScreenlyMetadata> = {},
  settings: Partial<ScreenlySettings> = {},
  corsProxyUrl?: string,
): ScreenlyObject {
  const mock = createMockScreenly(metadata, settings, corsProxyUrl)
  global.screenly = mock
  return mock
}

/**
 * Reset the global screenly mock
 */
export function resetScreenlyMock(): void {
  delete global.screenly
}
