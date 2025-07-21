import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import App from '@/App.vue'

// Override existing mocked values
const mockScreenly = {
  metadata: {
    coordinates: [40.7128, -74.006] as [number, number],
    hostname: 'test-host',
    screen_name: 'test-screen',
    hardware: 'test-hardware',
    location: 'test-location',
    screenly_version: 'test-version',
    tags: ['tag1', 'tag2', 'tag3'],
  },
  signalReadyForRendering: vi.fn(),
  settings: {},
  cors_proxy_url: 'https://example.com',
}

// Mock global screenly object
global.screenly = mockScreenly

// Mock the stores
vi.mock('./stores/root-store', () => ({
  useScreenlyMetadataStore: () => ({
    hostname: 'test-host',
    screenName: 'test-screen',
    hardware: 'test-hardware',
    screenlyVersion: 'test-version',
    formattedCoordinates: '40.7128° N, 74.0060° W',
    tags: ['tag1', 'tag2', 'tag3'],
  }),
  useSettingsStore: () => ({
    setupTheme: vi.fn(),
  }),
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders properly', () => {
    const wrapper = mount(App)

    // Section headers to check
    const sectionHeaders: string[] = [
      'Host Name',
      'Name',
      'Hardware',
      'Version',
      'Coordinates',
      'Labels',
      'Powered by Screenly',
    ]
    sectionHeaders.forEach((header) => {
      expect(wrapper.text()).toContain(header)
    })

    // Actual values to check
    const values: string[] = [
      'test-host',
      'test-screen',
      'test-hardware',
      'test-version',
      '40.7128° N, 74.0060° W',
      'tag1',
      'tag2',
      'tag3',
    ]
    values.forEach((value) => {
      expect(wrapper.text()).toContain(value)
    })
  })
})
