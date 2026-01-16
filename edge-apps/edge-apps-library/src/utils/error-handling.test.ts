import { describe, test, expect, afterEach, spyOn } from 'bun:test'
import { setupErrorHandling } from './error-handling'
import { setupScreenlyMock, resetScreenlyMock } from '../test'

describe('error-handling utilities', () => {
  afterEach(() => {
    resetScreenlyMock()
  })

  describe('setupErrorHandling', () => {
    test('should not throw when display_errors is disabled by default', () => {
      setupScreenlyMock({}, {})
      expect(() => {
        setupErrorHandling()
      }).not.toThrow()
    })

    test('should not throw when display_errors is enabled', () => {
      setupScreenlyMock({}, { display_errors: 'true' })
      expect(() => {
        setupErrorHandling()
      }).not.toThrow()
    })

    test('should add event listeners when display_errors is enabled', () => {
      setupScreenlyMock({}, { display_errors: 'true' })
      const addEventListenerSpy = spyOn(window, 'addEventListener')

      setupErrorHandling()

      expect(addEventListenerSpy).toHaveBeenCalled()
      addEventListenerSpy.mockRestore()
    })

    test('should not add event listeners when display_errors is disabled', () => {
      setupScreenlyMock({}, { display_errors: 'false' })
      const addEventListenerSpy = spyOn(window, 'addEventListener')

      setupErrorHandling()

      expect(addEventListenerSpy).not.toHaveBeenCalled()
      addEventListenerSpy.mockRestore()
    })
  })
})
