import { vi } from 'vitest'

// Mock screenly global for all tests
global.screenly = {
  signalReadyForRendering: vi.fn(),
  metadata: {
    coordinates: [0, 0],
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
