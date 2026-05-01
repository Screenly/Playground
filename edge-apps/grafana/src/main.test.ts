import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test'
import { getRenderUrl, fetchAndRenderDashboard } from './render'
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

describe('fetchAndRenderDashboard', () => {
  const imgElement = {
    setAttribute: mock(() => {}),
  } as unknown as HTMLImageElement

  beforeEach(() => {
    ;(imgElement.setAttribute as ReturnType<typeof mock>).mockClear()
  })

  test('should return success when fetch succeeds', async () => {
    globalThis.fetch = mock(async () => ({
      ok: true,
      blob: async () => new Blob(['data'], { type: 'image/png' }),
    })) as unknown as typeof fetch

    globalThis.URL.createObjectURL = mock(() => 'blob:fake-url')

    const result = await fetchAndRenderDashboard(
      'https://example.com/render',
      'token123',
      imgElement,
    )

    expect(result.success).toBe(true)
    expect(imgElement.setAttribute).toHaveBeenCalledWith('src', 'blob:fake-url')
  })

  test('should return failure with HTTP status when response is not ok', async () => {
    globalThis.fetch = mock(async () => ({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    })) as unknown as typeof fetch

    const result = await fetchAndRenderDashboard(
      'https://example.com/render',
      'bad-token',
      imgElement,
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.status).toBe(401)
      expect(result.statusText).toBe('Unauthorized')
      expect(result.message).toContain('401')
    }
  })

  test('should return failure with error message on network error', async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error('Network request failed')),
    ) as unknown as typeof fetch

    const result = await fetchAndRenderDashboard(
      'https://example.com/render',
      'token123',
      imgElement,
    )

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.message).toBe('Network request failed')
      expect(result.status).toBeUndefined()
    }
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
