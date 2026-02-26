import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'
import { getSettingWithDefault } from '@screenly/edge-apps'

describe('Birthday Greeting App Settings', () => {
  beforeEach(() => {
    setupScreenlyMock(
      {
        location: 'Office Lobby',
        hostname: 'display-01',
      },
      {
        name: 'John Doe',
        role: 'Software Engineer',
        image: '',
      },
    )
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  test('should retrieve name setting correctly', () => {
    const name = getSettingWithDefault<string>('name', 'Default Name')

    expect(name).toBe('John Doe')
  })

  test('should retrieve role setting correctly', () => {
    const role = getSettingWithDefault<string>('role', 'Default Role')

    expect(role).toBe('Software Engineer')
  })

  test('should return default value when setting is not set', () => {
    setupScreenlyMock({}, {})

    const name = getSettingWithDefault<string>('name', 'Amy Smith')
    const role = getSettingWithDefault<string>('role', 'Sales Manager')

    expect(name).toBe('Amy Smith')
    expect(role).toBe('Sales Manager')
  })

  test('should handle empty image setting', () => {
    const image = getSettingWithDefault<string>('image', '')

    expect(image).toBe('')
  })
})

describe('Birthday Greeting App with Image', () => {
  afterEach(() => {
    resetScreenlyMock()
  })

  test('should retrieve base64 image setting when provided', () => {
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='

    setupScreenlyMock(
      {
        location: 'Conference Room',
        hostname: 'display-02',
      },
      {
        name: 'Jane Smith',
        role: 'Product Manager',
        image: testBase64,
      },
    )

    const image = getSettingWithDefault<string>('image', '')

    expect(image).toBe(testBase64)
  })

  test('should handle pure base64 string without data URI prefix', () => {
    const pureBase64 = '/9j/4AAQSkZJRg=='

    setupScreenlyMock(
      {},
      {
        name: 'Test User',
        role: 'Test Role',
        image: pureBase64,
      },
    )

    const image = getSettingWithDefault<string>('image', '')

    expect(image).toBe(pureBase64)
  })
})

describe('Birthday Greeting App Metadata', () => {
  beforeEach(() => {
    setupScreenlyMock(
      {
        location: 'Main Office',
        hostname: 'birthday-display',
      },
      {},
    )
  })

  afterEach(() => {
    resetScreenlyMock()
  })

  test('should have access to screen metadata', () => {
    expect(screenly.metadata.location).toBe('Main Office')
    expect(screenly.metadata.hostname).toBe('birthday-display')
  })
})
