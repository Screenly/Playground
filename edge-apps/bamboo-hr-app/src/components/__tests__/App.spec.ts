import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import App from '../../App.vue'

// Mock global screenly object
global.screenly = {
  signalReadyForRendering: vi.fn(),
  settings: {
    screenly_color_accent: '#000000',
    screenly_color_light: '#000000',
    screenly_color_dark: '#000000',
  },
}

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders properly with app title', () => {
    const wrapper = mount(App)

    // Check for app title
    expect(wrapper.text()).toContain('BambooHR App')
  })
})
