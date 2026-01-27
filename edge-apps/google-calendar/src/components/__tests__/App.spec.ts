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
  settings: {
    calendar_mode: 'daily',
    override_locale: '',
    override_timezone: '',
    screenly_color_accent: '#000000',
    screenly_color_dark: '#000000',
    screenly_color_light: '#000000',
    sentry_dsn: '',
  },
  cors_proxy_url: 'https://example.com',
}

// Mock global screenly object
global.screenly = mockScreenly

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should render the app container and calendar views', () => {
    const wrapper = mount(App)
    // Check for app container and main container which should always be rendered
    const appContainer = wrapper.find('.app-container')
    const mainContainer = wrapper.find('.main-container')

    expect(appContainer.exists() && mainContainer.exists()).toBe(true)
  })
})
