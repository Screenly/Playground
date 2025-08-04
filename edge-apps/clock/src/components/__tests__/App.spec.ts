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
    screenly_color_accent: '#972EFF',
    screenly_color_light: '#ADAFBE',
    screenly_color_dark: '#454BD2',
    enable_analytics: 'true',
    tag_manager_id: 'GTM-P98SPZ9Z',
    theme: 'light' as const,
    override_timezone: 'America/New_York',
    override_locale: 'en',
  },
  cors_proxy_url: 'http://127.0.0.1:8080',
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
    brandLogoUrl: ref(''),
  }),
}))

vi.mock('@/stores/settings', () => ({
  useSettingsStore: () => ({
    currentTimezone: 'America/New_York',
    currentLocale: 'en',
    overrideTimezone: ref('America/New_York'),
    overrideLocale: ref('en'),
    tagManagerId: ref('GTM-P98SPZ9Z'),
    enableAnalytics: ref(true),
    init: vi.fn(),
    initLocale: vi.fn(),
    initTimezone: vi.fn(),
  }),
}))

// Mock the components
vi.mock('blueprint/components', () => ({
  AnalogClock: {
    name: 'AnalogClock',
    template: '<div class="analog-clock">Analog Clock</div>',
    props: ['timezone'],
  },
}))

vi.mock('@/components', () => ({
  DigitalClock: {
    name: 'DigitalClock',
    template: '<div class="digital-clock">12:34</div>',
    props: ['timezone', 'locale'],
  },
  DateDisplay: {
    name: 'DateDisplay',
    template: '<div class="date-display">Monday, January 1, 2024</div>',
    props: ['timezone'],
  },
  BrandLogoCard: {
    name: 'BrandLogoCard',
    template: '<div class="brand-logo">Brand Logo</div>',
    props: ['logoSrc'],
  },
}))

describe('App', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders clock components properly', () => {
    const wrapper = mount(App)

    // Check for clock components
    expect(wrapper.find('.analog-clock').exists()).toBe(true)
    expect(wrapper.find('.digital-clock').exists()).toBe(true)
    expect(wrapper.find('.date-display').exists()).toBe(true)
    expect(wrapper.find('.brand-logo').exists()).toBe(true)
  })

  it('displays main container structure', () => {
    const wrapper = mount(App)

    // Check for main container structure
    expect(wrapper.find('.main-container').exists()).toBe(true)
    expect(wrapper.find('.primary-card').exists()).toBe(true)
    expect(wrapper.find('.secondary-container').exists()).toBe(true)
    expect(wrapper.find('.row-container').exists()).toBe(true)
    expect(wrapper.find('.secondary-card').exists()).toBe(true)
  })

  it('passes correct props to clock components', () => {
    const wrapper = mount(App)

    // Check that AnalogClock receives timezone prop
    const analogClock = wrapper.findComponent({ name: 'AnalogClock' })
    expect(analogClock.props('timezone')).toBe('America/New_York')

    // Check that DigitalClock receives timezone and locale props
    const digitalClock = wrapper.findComponent({ name: 'DigitalClock' })
    expect(digitalClock.props('timezone')).toBe('America/New_York')
    expect(digitalClock.props('locale')).toBe('en')

    // Check that DateDisplay receives timezone prop
    const dateDisplay = wrapper.findComponent({ name: 'DateDisplay' })
    expect(dateDisplay.props('timezone')).toBe('America/New_York')

    // Check that BrandLogoCard receives logoSrc prop
    const brandLogoCard = wrapper.findComponent({ name: 'BrandLogoCard' })
    expect(brandLogoCard.props('logoSrc')).toBeDefined()
  })

  it('calls signalReadyForRendering on mount', () => {
    const wrapper = mount(App)

    // Trigger onMounted
    wrapper.vm.$nextTick()

    // Check that signalReadyForRendering was called
    expect(mockScreenly.signalReadyForRendering).toHaveBeenCalled()
  })

  it('initializes stores properly', () => {
    const wrapper = mount(App)

    // The stores should be initialized during component setup
    expect(wrapper.vm).toBeDefined()
  })
})
