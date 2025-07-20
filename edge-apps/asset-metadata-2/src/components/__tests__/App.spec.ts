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

    // Check section headers
    expect(wrapper.text()).toContain('Host Name')
    expect(wrapper.text()).toContain('Name')
    expect(wrapper.text()).toContain('Hardware')
    expect(wrapper.text()).toContain('Version')
    expect(wrapper.text()).toContain('Coordinates')
    expect(wrapper.text()).toContain('Labels')
    expect(wrapper.text()).toContain('Powered by Screenly')

    // Check actual values
    expect(wrapper.text()).toContain('test-host')
    expect(wrapper.text()).toContain('test-screen')
    expect(wrapper.text()).toContain('test-hardware')
    expect(wrapper.text()).toContain('test-version')
    expect(wrapper.text()).toContain('40.7128° N, 74.0060° W')
    expect(wrapper.text()).toContain('tag1')
    expect(wrapper.text()).toContain('tag2')
    expect(wrapper.text()).toContain('tag3')
  })
})
