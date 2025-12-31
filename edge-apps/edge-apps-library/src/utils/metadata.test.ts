import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import {
  getMetadata,
  getFormattedCoordinates,
  getScreenName,
  getHostname,
  getLocation,
  getHardware,
  getScreenlyVersion,
  getTags,
  hasTag,
  isAnywhereScreen,
} from './metadata'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

describe('metadata utilities', () => {
  beforeEach(() => {
    setupScreenlyMock({
      coordinates: [37.3861, -122.0839],
      hostname: 'test-host',
      location: 'Test Location',
      hardware: 'Raspberry Pi 4',
      screenly_version: '1.2.3',
      screen_name: 'Main Screen',
      tags: ['lobby', 'reception', 'main'],
    })
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  describe('getMetadata', () => {
    test('should return complete metadata object', () => {
      const metadata = getMetadata()
      expect(metadata).toEqual({
        coordinates: [37.3861, -122.0839],
        hostname: 'test-host',
        location: 'Test Location',
        hardware: 'Raspberry Pi 4',
        screenly_version: '1.2.3',
        screen_name: 'Main Screen',
        tags: ['lobby', 'reception', 'main'],
      })
    })
  })

  describe('getFormattedCoordinates', () => {
    test('should return formatted coordinates string', () => {
      const formatted = getFormattedCoordinates()
      expect(formatted).toBe('37.3861° N, 122.0839° W')
    })
  })

  describe('getScreenName', () => {
    test('should return screen name', () => {
      expect(getScreenName()).toBe('Main Screen')
    })
  })

  describe('getHostname', () => {
    test('should return hostname', () => {
      expect(getHostname()).toBe('test-host')
    })
  })

  describe('getLocation', () => {
    test('should return location', () => {
      expect(getLocation()).toBe('Test Location')
    })
  })

  describe('getHardware', () => {
    test('should return hardware', () => {
      expect(getHardware()).toBe('Raspberry Pi 4')
    })
  })

  describe('getScreenlyVersion', () => {
    test('should return Screenly version', () => {
      expect(getScreenlyVersion()).toBe('1.2.3')
    })
  })

  describe('getTags', () => {
    test('should return tags array', () => {
      const tags = getTags()
      expect(tags).toEqual(['lobby', 'reception', 'main'])
    })
  })

  describe('hasTag', () => {
    test('should return true for existing tag', () => {
      expect(hasTag('lobby')).toBe(true)
      expect(hasTag('reception')).toBe(true)
      expect(hasTag('main')).toBe(true)
    })

    test('should return false for non-existing tag', () => {
      expect(hasTag('nonexistent')).toBe(false)
      expect(hasTag('other')).toBe(false)
    })
  })

  describe('isAnywhereScreen', () => {
    test('should return false when hardware is not empty', () => {
      expect(isAnywhereScreen()).toBe(false)
    })

    test.each([
      ['empty string', ''],
      ['undefined', undefined],
    ])(
      'should return true when hardware is %s',
      (_: string, hardware: string | undefined) => {
        setupScreenlyMock({
          coordinates: [37.3861, -122.0839],
          hostname: 'test-host',
          location: 'Test Location',
          hardware: hardware as string | undefined,
          screenly_version: '1.2.3',
          screen_name: 'Main Screen',
          tags: [],
        })
        expect(isAnywhereScreen()).toBe(true)
      },
    )
  })
})
