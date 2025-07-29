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
    greeting: 'World',
    secretWord: 'test-secret',
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

  it('renders properly with greeting', () => {
    const wrapper = mount(App)

    // Check for greeting and secret word
    expect(wrapper.text()).toContain('Greetings, World!')
    expect(wrapper.text()).toContain('You secret word is')
    expect(wrapper.text()).toContain('test-secret')

    // Check for screen information
    expect(wrapper.text()).toContain('test-screen')
    expect(wrapper.text()).toContain('test-location')
    expect(wrapper.text()).toContain('40.7128')
    expect(wrapper.text()).toContain('-74.006')

    // Check for hardware and hostname
    expect(wrapper.text()).toContain('test-host')
    expect(wrapper.text()).toContain('test-hardware')

    // Check for specific text content
    expect(wrapper.text()).toContain("I'm test-screen")
    expect(wrapper.text()).toContain('My Screenly ID is')
    expect(wrapper.text()).toContain('which conveniently is also my hostname')
    expect(wrapper.text()).toContain("and I'm running on a")
  })

  it('displays coordinates correctly', () => {
    const wrapper = mount(App)

    // Check that coordinates are displayed with degree symbols
    expect(wrapper.text()).toContain('40.7128°')
    expect(wrapper.text()).toContain('-74.006°')
  })

  it('handles missing secret word', () => {
    // Mock screenly with no secret word
    const mockScreenlyNoSecret = {
      ...mockScreenly,
      settings: {
        ...mockScreenly.settings,
        secretWord: undefined,
      },
    }
    global.screenly = mockScreenlyNoSecret

    const wrapper = mount(App)

    expect(wrapper.text()).toContain('not set')
    expect(wrapper.text()).not.toContain('test-secret')
  })

  it('handles empty greeting', () => {
    // Mock screenly with empty greeting
    const mockScreenlyEmptyGreeting = {
      ...mockScreenly,
      settings: {
        ...mockScreenly.settings,
        greeting: '',
      },
    }
    global.screenly = mockScreenlyEmptyGreeting

    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Greetings!')
    expect(wrapper.text()).not.toContain('Greetings, World!')
  })

  it('handles undefined greeting', () => {
    // Mock screenly with undefined greeting
    const mockScreenlyUndefinedGreeting = {
      ...mockScreenly,
      settings: {
        ...mockScreenly.settings,
        greeting: undefined,
      },
    }
    global.screenly = mockScreenlyUndefinedGreeting

    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Greetings!')
    expect(wrapper.text()).not.toContain('Greetings, World!')
  })
})
