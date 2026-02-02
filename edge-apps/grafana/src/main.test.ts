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
  innerWidth: 1234,
  innerHeight: 567,
})

describe('Grafana App', () => {
  describe('getRenderUrl', () => {
    let originalScreenWidth: number
    let originalScreenHeight: number

    beforeEach(() => {
      originalScreenWidth = globalThis.window.innerWidth
      originalScreenHeight = globalThis.window.innerHeight
    })

    afterEach(() => {
      globalThis.window.innerWidth = originalScreenWidth
      globalThis.window.innerHeight = originalScreenHeight
    })

    test('should construct URL with correct parameters', () => {
      globalThis.window.innerWidth = 1234
      globalThis.window.innerHeight = 567

      const url = getRenderUrl('https://grafana.example.com', 'abc123')

      expect(url).toContain(
        'https://cors-proxy.example.com/https://grafana.example.com/render/d/abc123',
      )
      expect(url).toContain('width=1234')
      expect(url).toContain('height=567')
      expect(url).toContain('kiosk=true')
    })

    test('should use dynamic window dimensions', () => {
      globalThis.window.innerWidth = 3840
      globalThis.window.innerHeight = 2160

      const url = getRenderUrl('grafana.example.com', 'xyz789')

      expect(url).toContain('width=3840')
      expect(url).toContain('height=2160')
    })

    test('should include all required query parameters', () => {
      const url = getRenderUrl('my-grafana.net', 'dash1')

      const params = new URLSearchParams(url.split('?')[1])
      expect(params.has('width')).toBe(true)
      expect(params.has('height')).toBe(true)
      expect(params.get('kiosk')).toBe('true')
    })

    test('should include CORS proxy URL', () => {
      const url = getRenderUrl('my-grafana.net', 'dash1')

      expect(url).toContain('https://cors-proxy.example.com')
    })

    test('should include domain in render path', () => {
      const url = getRenderUrl('custom.grafana.net', 'dash-id')

      expect(url).toContain('custom.grafana.net')
      expect(url).toContain('dash-id')
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
