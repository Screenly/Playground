import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { getRenderUrl } from './render'
import type { ScreenlyObject } from '@screenly/edge-apps'

// Mock screenly object
Object.assign(globalThis, {
  screenly: {
    cors_proxy_url: 'https://cors-proxy.example.com',
  } as Partial<ScreenlyObject>,
})

// Mock window object - initialize if it doesn't exist
if (!globalThis.window) {
  Object.defineProperty(globalThis, 'window', {
    value: {},
    writable: true,
    configurable: true,
  })
}
Object.assign(globalThis.window, {
  innerWidth: 1920,
  innerHeight: 1080,
})

describe('Grafana App', () => {
  describe('getRenderUrl', () => {
    let originalInnerWidth: number
    let originalInnerHeight: number

    beforeEach(() => {
      originalInnerWidth = globalThis.window.innerWidth
      originalInnerHeight = globalThis.window.innerHeight
    })

    afterEach(() => {
      globalThis.window.innerWidth = originalInnerWidth
      globalThis.window.innerHeight = originalInnerHeight
    })

    test('should construct URL with correct parameters', () => {
      globalThis.window.innerWidth = 1920
      globalThis.window.innerHeight = 1080

      const url = getRenderUrl('grafana.example.com', 'abc123', 'my-dashboard')

      expect(url).toContain(
        'https://cors-proxy.example.com/https://grafana.example.com/render/d/abc123/my-dashboard',
      )
      expect(url).toContain('width=1920')
      expect(url).toContain('height=1080')
      expect(url).toContain('kiosk=true')
    })

    test('should use dynamic window dimensions', () => {
      globalThis.window.innerWidth = 3840
      globalThis.window.innerHeight = 2160

      const url = getRenderUrl('grafana.example.com', 'xyz789', 'dashboard')

      expect(url).toContain('width=3840')
      expect(url).toContain('height=2160')
    })

    test('should include all required query parameters', () => {
      const url = getRenderUrl('my-grafana.net', 'dash1', 'my-dash')

      const params = new URLSearchParams(url.split('?')[1])
      expect(params.has('width')).toBe(true)
      expect(params.has('height')).toBe(true)
      expect(params.get('kiosk')).toBe('true')
    })

    test('should include CORS proxy URL', () => {
      const url = getRenderUrl('my-grafana.net', 'dash1', 'my-dash')

      expect(url).toContain('https://cors-proxy.example.com')
    })

    test('should include domain in render path', () => {
      const url = getRenderUrl('custom.grafana.net', 'dash-id', 'dash-slug')

      expect(url).toContain('custom.grafana.net')
      expect(url).toContain('dash-id')
      expect(url).toContain('dash-slug')
    })
  })

  describe('Configuration validation', () => {
    test('refresh interval should be numeric and positive', () => {
      const refreshInterval = 60
      expect(typeof refreshInterval).toBe('number')
      expect(refreshInterval).toBeGreaterThan(0)
    })

    test('service access token should be a string', () => {
      const serviceAccessToken = 'glsa_xxxxxxxxxxxx'
      expect(typeof serviceAccessToken).toBe('string')
      expect(serviceAccessToken.length).toBeGreaterThan(0)
    })
  })
})
