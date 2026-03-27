import { describe, test, expect } from 'bun:test'
import { isValidBase64Image, formatBase64Image } from './image'

describe('isValidBase64Image', () => {
  describe('valid inputs', () => {
    test('should return true for valid data URIs with various image formats', () => {
      const testCases = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
        'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        'data:image/jpg;base64,/9j/4AAQSkZJRg==',
        'data:image/gif;base64,R0lGODlhAQABAIAAAP',
        'data:image/webp;base64,UklGRiQAAABXRUJQ',
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0',
      ]

      testCases.forEach((dataUri) => {
        expect(isValidBase64Image(dataUri)).toBe(true)
      })
    })

    test('should return true for pure base64 strings', () => {
      expect(isValidBase64Image('/9j/4AAQSkZJRg==')).toBe(true)
      expect(isValidBase64Image('SGVsbG8gV29ybGQ=')).toBe(true)
      expect(
        isValidBase64Image(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        ),
      ).toBe(true)
    })

    test('should return true for base64 string with whitespace', () => {
      const base64WithWhitespace = '/9j/4AAQ SkZJ Rg=='
      expect(isValidBase64Image(base64WithWhitespace)).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    test('should return false for empty or whitespace-only strings', () => {
      expect(isValidBase64Image('')).toBe(false)
      expect(isValidBase64Image('   ')).toBe(false)
      expect(isValidBase64Image('  \t\n  ')).toBe(false)
    })

    test('should return false for strings with invalid characters', () => {
      expect(isValidBase64Image('invalid!@#$%^&*()')).toBe(false)
      expect(isValidBase64Image('This is just plain text')).toBe(false)
      expect(isValidBase64Image('<img src="image.jpg" />')).toBe(false)
    })

    test('should return false for invalid data URIs', () => {
      expect(isValidBase64Image('data:text/plain;base64,SGVsbG8=')).toBe(false)
      expect(isValidBase64Image('data:image/png,iVBORw0KGgo')).toBe(false)
      expect(isValidBase64Image('data:image/')).toBe(false)
    })

    test('should return false for URLs', () => {
      expect(isValidBase64Image('https://example.com/image.jpg')).toBe(false)
    })
  })
})

describe('formatBase64Image', () => {
  test('should return unchanged for complete data URIs', () => {
    const testCases = [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
      'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      'data:image/gif;base64,R0lGODlhAQABAIAAAP',
      'data:image/webp;base64,UklGRiQAAABXRUJQ',
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0',
      'data:image/custom;base64,somedata',
    ]

    testCases.forEach((dataUri) => {
      expect(formatBase64Image(dataUri)).toBe(dataUri)
    })
  })

  test('should add data URI prefix to pure base64 strings', () => {
    const testCases = [
      {
        input: '/9j/4AAQSkZJRg==',
        expected: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      },
      {
        input: 'SGVsbG8gV29ybGQ=',
        expected: 'data:image/jpeg;base64,SGVsbG8gV29ybGQ=',
      },
      { input: 'ABC+/123==', expected: 'data:image/jpeg;base64,ABC+/123==' },
      {
        input:
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        expected:
          'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      },
      { input: '', expected: 'data:image/jpeg;base64,' },
    ]

    testCases.forEach(({ input, expected }) => {
      expect(formatBase64Image(input)).toBe(expected)
    })
  })
})
