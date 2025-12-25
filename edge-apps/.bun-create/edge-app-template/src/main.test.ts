import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

describe('Simple Edge App', () => {
  beforeEach(() => {
    setupScreenlyMock({}, { message: 'Hello, world!' })
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  test('should display the message from settings', () => {
    const message = screenly.settings.message as string
    expect(message).toBe('Hello, world!')
  })
})
