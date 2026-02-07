/* eslint-disable max-lines-per-function */
import { describe, test, expect } from 'bun:test'
import {
  isNightForTimestamp,
  getWeatherIconKey,
  getWeatherIconUrl,
} from './weather'

describe('weather', () => {
  describe('isNightForTimestamp', () => {
    test('should return true for nighttime hours (8 PM - 5 AM)', () => {
      // Create timestamps for specific hours in UTC
      const makeTimestamp = (hour: number) => {
        const date = new Date('2024-01-15T00:00:00Z')
        date.setUTCHours(hour)
        return Math.floor(date.getTime() / 1000)
      }

      // Night hours: <= 5 or >= 20
      expect(isNightForTimestamp(makeTimestamp(0), 'UTC')).toBe(true) // 12 AM
      expect(isNightForTimestamp(makeTimestamp(3), 'UTC')).toBe(true) // 3 AM
      expect(isNightForTimestamp(makeTimestamp(5), 'UTC')).toBe(true) // 5 AM
      expect(isNightForTimestamp(makeTimestamp(20), 'UTC')).toBe(true) // 8 PM
      expect(isNightForTimestamp(makeTimestamp(23), 'UTC')).toBe(true) // 11 PM
    })

    test('should return false for daytime hours (6 AM - 7 PM)', () => {
      const makeTimestamp = (hour: number) => {
        const date = new Date('2024-01-15T00:00:00Z')
        date.setUTCHours(hour)
        return Math.floor(date.getTime() / 1000)
      }

      // Day hours: 6-19
      expect(isNightForTimestamp(makeTimestamp(6), 'UTC')).toBe(false) // 6 AM
      expect(isNightForTimestamp(makeTimestamp(12), 'UTC')).toBe(false) // Noon
      expect(isNightForTimestamp(makeTimestamp(19), 'UTC')).toBe(false) // 7 PM
    })
  })

  describe('getWeatherIconKey', () => {
    const dayTimestamp = Math.floor(
      new Date('2024-01-15T12:00:00Z').getTime() / 1000,
    )
    const nightTimestamp = Math.floor(
      new Date('2024-01-15T22:00:00Z').getTime() / 1000,
    )

    test('should return correct icon for weather conditions', () => {
      expect(getWeatherIconKey(200, dayTimestamp, 'UTC')).toBe('thunderstorm')
      expect(getWeatherIconKey(300, dayTimestamp, 'UTC')).toBe('drizzle')
      expect(getWeatherIconKey(500, dayTimestamp, 'UTC')).toBe('rain')
      expect(getWeatherIconKey(600, dayTimestamp, 'UTC')).toBe('snow')
      expect(getWeatherIconKey(700, dayTimestamp, 'UTC')).toBe('haze')
      expect(getWeatherIconKey(800, dayTimestamp, 'UTC')).toBe('clear')
      expect(getWeatherIconKey(801, dayTimestamp, 'UTC')).toBe(
        'partially-cloudy',
      )
      expect(getWeatherIconKey(802, dayTimestamp, 'UTC')).toBe('mostly-cloudy')
    })

    test('should return night variants for supported conditions', () => {
      expect(getWeatherIconKey(800, nightTimestamp, 'UTC')).toBe('clear-night')
      expect(getWeatherIconKey(500, nightTimestamp, 'UTC')).toBe('rain-night')
      expect(getWeatherIconKey(802, nightTimestamp, 'UTC')).toBe(
        'mostly-cloudy-night',
      )
      expect(getWeatherIconKey(801, nightTimestamp, 'UTC')).toBe(
        'partially-cloudy-night',
      )
      expect(getWeatherIconKey(200, nightTimestamp, 'UTC')).toBe(
        'thunderstorm-night',
      )
    })

    test('should return day variants for conditions without night override', () => {
      expect(getWeatherIconKey(300, nightTimestamp, 'UTC')).toBe('drizzle')
      expect(getWeatherIconKey(600, nightTimestamp, 'UTC')).toBe('snow')
      expect(getWeatherIconKey(700, nightTimestamp, 'UTC')).toBe('haze')
    })
  })

  describe('getWeatherIconUrl', () => {
    test('should return correct URL with default icon base', () => {
      expect(getWeatherIconUrl('clear')).toBe('/assets/images/icons/clear.svg')
      expect(getWeatherIconUrl('rain')).toBe('/assets/images/icons/rainy.svg')
      expect(getWeatherIconUrl('clear-night')).toBe(
        '/assets/images/icons/clear-night.svg',
      )
    })

    test('should return correct URL with custom icon base', () => {
      const customBase = '/custom/path'
      expect(getWeatherIconUrl('clear', customBase)).toBe(
        '/custom/path/clear.svg',
      )
      expect(getWeatherIconUrl('rain', customBase)).toBe(
        '/custom/path/rainy.svg',
      )
    })

    test('should return default clear icon for unknown keys', () => {
      expect(getWeatherIconUrl('unknown-icon')).toBe(
        '/assets/images/icons/clear.svg',
      )
      expect(getWeatherIconUrl('invalid', '/custom')).toBe('/custom/clear.svg')
    })
  })
})
