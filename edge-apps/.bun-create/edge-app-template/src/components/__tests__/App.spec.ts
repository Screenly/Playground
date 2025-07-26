import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'

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
  settings: {
    screenly_color_accent: '#000000',
    screenly_color_light: '#000000',
    screenly_color_dark: '#000000',
  },
  cors_proxy_url: 'https://example.com',
}

// Mock global screenly object
global.screenly = mockScreenly

// Mock the stores
vi.mock('@/stores/metadata-store', () => ({
  useScreenlyMetadataStore: () => ({
    hostname: ref('test-host'),
    screenName: ref('test-screen'),
    hardware: ref('test-hardware'),
    screenlyVersion: ref('test-version'),
    formattedCoordinates: ref('40.7128° N, 74.0060° W'),
    tags: ref(['tag1', 'tag2', 'tag3']),
  }),
}))
vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: () => ({
    setupTheme: vi.fn(),
    setupBrandingLogo: vi.fn(),
    primaryThemeColor: ref(mockScreenly.settings.screenly_color_accent),
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
