import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'

import { mount } from '@vue/test-utils'
import App from '@/App.vue'

// Mock global screenly object
const mockScreenly = {
  signalReadyForRendering: vi.fn(),
  metadata: {
    coordinates: [40.7128, -74.006] as [number, number],
    hostname: 'test-host',
    screen_name: 'test-screen',
    hardware: 'test-hardware',
    location: 'test-location',
    screenly_version: 'test-version',
    tags: ['tag1', 'tag2', 'tag3'],
  },
  settings: {
    welcome_heading: 'Welcome',
    welcome_message: 'to the team',
    theme: 'light',
    override_locale: 'en',
    override_timezone: 'America/New_York',
    screenly_color_accent: '#000000',
    screenly_color_dark: '#000000',
    screenly_color_light: '#000000',
  },
  cors_proxy_url: 'https://example.com',
}

global.screenly = mockScreenly

// Mock blueprint stores
vi.mock('blueprint/stores/base-settings-store', () => ({
  baseSettingsStoreSetup: () => ({
    setupTheme: vi.fn(),
    setupBrandingLogo: vi.fn(),
    brandLogoUrl: ref(''),
  }),
}))

vi.mock('blueprint/stores/metadata-store', () => ({
  metadataStoreSetup: () => ({
    coordinates: [40.7128, -74.006],
  }),
}))

// Mock blueprint components
vi.mock('blueprint/components', () => ({
  AnalogClock: {
    name: 'AnalogClock',
    template: '<div class="analog-clock">Mock Clock</div>',
    props: ['timezone', 'locale'],
  },
  DateDisplay: {
    name: 'DateDisplay',
    template: '<div class="date-display">Mock Date</div>',
    props: ['timezone', 'locale'],
  },
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders welcome heading and message', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Welcome')
    expect(wrapper.text()).toContain('to the team')
  })

  it('renders clock and date components', () => {
    const wrapper = mount(App)

    expect(wrapper.find('.analog-clock').exists()).toBe(true)
    expect(wrapper.find('.date-display').exists()).toBe(true)
  })

  it('calls signalReadyForRendering on mount', () => {
    mount(App)

    expect(mockScreenly.signalReadyForRendering).toHaveBeenCalled()
  })

  it('handles missing welcome heading', () => {
    global.screenly = {
      ...mockScreenly,
      settings: {
        ...mockScreenly.settings,
        welcome_heading: undefined,
        theme: 'light' as 'light' | 'dark',
      },
    }

    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Welcome') // default fallback
  })

  it('handles missing welcome message', () => {
    global.screenly = {
      ...mockScreenly,
      settings: {
        ...mockScreenly.settings,
        welcome_message: undefined,
        theme: 'light' as 'light' | 'dark',
      },
    }

    const wrapper = mount(App)

    expect(wrapper.text()).toContain('to the team') // default fallback
  })
})
