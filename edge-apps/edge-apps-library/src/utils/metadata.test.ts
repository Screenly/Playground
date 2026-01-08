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
} from './metadata'
import { Hardware } from '../types/index.js'
import { setupScreenlyMock, resetScreenlyMock } from '../test/mock'

// eslint-disable-next-line max-lines-per-function
describe('metadata utilities', () => {
  beforeEach(() => {
    setupScreenlyMock({
      coordinates: [37.3861, -122.0839],
      hostname: 'test-host',
      location: 'Test Location',
      hardware: 'Raspberry Pi',
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
        hardware: 'Raspberry Pi',
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
    test('should return RaspberryPi enum value', () => {
      expect(getHardware()).toBe(Hardware.RaspberryPi)
    })

    test('should return Anywhere enum value when hardware is undefined', () => {
      setupScreenlyMock({
        coordinates: [37.3861, -122.0839],
        hostname: 'test-host',
        location: 'Test Location',
        hardware: undefined,
        screenly_version: '1.2.3',
        screen_name: 'Main Screen',
        tags: [],
      })
      expect(getHardware()).toBe(Hardware.Anywhere)
    })

    test('should return ScreenlyPlayerMax enum value for Screenly Player Max hardware', () => {
      setupScreenlyMock({
        coordinates: [37.3861, -122.0839],
        hostname: 'test-host',
        location: 'Test Location',
        hardware: 'Screenly Player Max',
        screenly_version: '1.2.3',
        screen_name: 'Main Screen',
        tags: [],
      })
      expect(getHardware()).toBe(Hardware.ScreenlyPlayerMax)
    })

    test('should return Unknown enum value for unknown hardware type', () => {
      setupScreenlyMock({
        coordinates: [37.3861, -122.0839],
        hostname: 'test-host',
        location: 'Test Location',
        hardware: 'Unknown Hardware',
        screenly_version: '1.2.3',
        screen_name: 'Main Screen',
        tags: [],
      })
      expect(getHardware()).toBe(Hardware.Unknown)
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
})
