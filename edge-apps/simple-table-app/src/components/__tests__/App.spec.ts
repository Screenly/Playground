import { describe, it, beforeEach, vi } from 'vitest'
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
    greeting: 'World',
    secret_word: 'test-secret',
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
    coordinates: ref([40.7128, -74.006]),
    location: ref('test-location'),
  }),
}))
vi.mock('@/stores/base-settings-store', () => ({
  useBaseSettingsStore: () => ({
    setupTheme: vi.fn(),
    setupBrandingLogo: vi.fn(),
    primaryThemeColor: ref(mockScreenly.settings.screenly_color_accent),
  }),
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // eslint-disable-next-line vitest/expect-expect
  it('renders properly with greeting', () => {
    mount(App)
  })
})
