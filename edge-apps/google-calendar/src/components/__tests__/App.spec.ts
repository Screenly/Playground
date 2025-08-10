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
    bypass_cors: false,
    calendar_mode: 'daily',
    enable_analytics: 'true',
    ical_url: 'https://example.com',
    override_locale: '',
    override_timezone: '',
    refresh_token: '',
    screenly_color_accent: '#000000',
    screenly_color_dark: '#000000',
    screenly_color_light: '#000000',
    sentry_dsn: '',
    tag_manager_id: '',
  },
  cors_proxy_url: 'https://example.com',
}

// Mock global screenly object
global.screenly = mockScreenly

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should display "Powered by Screenly" text', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Powered by Screenly')
  })
})
