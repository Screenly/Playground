import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { mount } from '@vue/test-utils'
import App from '@/App.vue'

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Hello!')
    expect(wrapper.text()).toContain('Coordinates: 0, 0')
    expect(wrapper.text()).toContain('Hostname: test-host')
    expect(wrapper.text()).toContain('Hardware: test-hardware')
    expect(wrapper.text()).toContain('Screenly Version: test-version')
    expect(wrapper.text()).toContain('Screen Name: test-screen')
  })
})
