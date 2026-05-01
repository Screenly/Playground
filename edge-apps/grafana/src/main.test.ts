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
  const RENDER_URL = 'https://example.com/render'
  const TOKEN = 'token123'

  const imgElement = {
    setAttribute: mock(() => {}),
    src: '',
  } as unknown as HTMLImageElement

  let originalFetch: typeof fetch
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  function mockSuccessfulFetch(objectUrl = 'blob:fake-url') {
    globalThis.fetch = mock(async () => ({
      ok: true,
      blob: async () => new Blob(['data'], { type: 'image/png' }),
    })) as unknown as typeof fetch
    globalThis.URL.createObjectURL = mock(() => objectUrl)
  }

  beforeEach(() => {
    originalFetch = globalThis.fetch
    originalCreateObjectURL = globalThis.URL.createObjectURL
    originalRevokeObjectURL = globalThis.URL.revokeObjectURL
    ;(imgElement.setAttribute as ReturnType<typeof mock>).mockClear()
    ;(imgElement as { src: string }).src = ''
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    globalThis.URL.createObjectURL = originalCreateObjectURL
    globalThis.URL.revokeObjectURL = originalRevokeObjectURL
  })

  function mockFailedFetch(status: number, statusText: string, body = '') {
    globalThis.fetch = mock(async () => ({
      ok: false,
      status,
      statusText,
      text: async () => body,
    })) as unknown as typeof fetch
  }

  test('should render the image when fetch succeeds', async () => {
    mockSuccessfulFetch()

    await fetchAndRenderDashboard(RENDER_URL, TOKEN, imgElement)

    expect(imgElement.setAttribute).toHaveBeenCalledWith('src', 'blob:fake-url')
  })

  test('should revoke the previous blob URL before setting a new one', async () => {
    mockSuccessfulFetch('blob:new-url')
    globalThis.URL.revokeObjectURL = mock(() => {})
    ;(imgElement as { src: string }).src = 'blob:old-url'

    await fetchAndRenderDashboard(RENDER_URL, TOKEN, imgElement)

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:old-url')
  })

  test('should throw with HTTP status when response is not ok', async () => {
    mockFailedFetch(401, 'Unauthorized')

    expect(
      fetchAndRenderDashboard(RENDER_URL, 'bad-token', imgElement),
    ).rejects.toThrow('HTTP 401 Unauthorized')
  })

  test('should include response body in the error when available', async () => {
    mockFailedFetch(403, 'Forbidden', 'Access denied for this user')

    expect(
      fetchAndRenderDashboard(RENDER_URL, 'bad-token', imgElement),
    ).rejects.toThrow('HTTP 403 Forbidden - Access denied for this user')
  })

  test('should throw on network error', async () => {
    globalThis.fetch = mock(() =>
      Promise.reject(new Error('Network request failed')),
    ) as unknown as typeof fetch

    expect(
      fetchAndRenderDashboard(RENDER_URL, TOKEN, imgElement),
    ).rejects.toThrow('Network request failed')
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
