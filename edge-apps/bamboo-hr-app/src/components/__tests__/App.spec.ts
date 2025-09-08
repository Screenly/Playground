import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import App from '../../App.vue'

// Mock global screenly object
global.screenly = {
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
    api_key: 'test-api-key',
    screenly_color_accent: '#000000',
    screenly_color_light: '#000000',
    screenly_color_dark: '#000000',
    enable_analytics: 'true',
    override_locale: 'en',
    override_timezone: 'UTC',
    sentry_dsn: '',
    tag_manager_id: '',
  },
  cors_proxy_url: 'https://example.com',
}

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders properly with dashboard title', () => {
    const wrapper = mount(App)

    // Check for dashboard title
    expect(wrapper.text()).toContain('BambooHR Dashboard')
    expect(wrapper.text()).toContain('Powered by Screenly')
  })

  it('displays dashboard sections', () => {
    const wrapper = mount(App)

    // Check for dashboard sections
    expect(wrapper.text()).toContain('On Leave Today')
    expect(wrapper.text()).toContain('Birthdays')
    expect(wrapper.text()).toContain('Anniversaries')
  })
})
