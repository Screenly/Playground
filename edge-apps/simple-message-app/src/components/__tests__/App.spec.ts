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
    enable_analytics: 'true',
    message_body: 'Test message body',
    message_header: 'Test message header',
    override_locale: 'en',
    override_timezone: 'America/New_York',
    screenly_color_accent: '#000000',
    screenly_color_dark: '#000000',
    screenly_color_light: '#000000',
    theme: 'light',
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
