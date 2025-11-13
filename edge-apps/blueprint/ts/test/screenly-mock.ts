import { vi } from 'vitest'

export const screenlyMock = {
  signalReadyForRendering: vi.fn(),
  metadata: {
    coordinates: [0, 0] as [number, number],
    hostname: 'test-host',
    location: 'test-location',
    hardware: 'test-hardware',
    screenly_version: 'test-version',
    screen_name: 'test-screen',
    tags: [],
  },
  settings: {},
  cors_proxy_url: 'http://test-proxy',
}

export const setupScreenlyMock = () => {
  globalThis.screenly = screenlyMock
}
