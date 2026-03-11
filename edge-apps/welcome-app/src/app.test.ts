import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

import init from './app'

describe('Welcome App', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <p id="welcome-heading"></p>
      <p id="welcome-message"></p>
    `

    setupScreenlyMock(
      {},
      {
        welcome_heading: 'Welcome',
        welcome_message: 'to the team',
      },
    )
  })

  afterEach(() => {
    resetScreenlyMock()
    document.body.innerHTML = ''
  })

  test('renders welcome heading from settings', () => {
    init()

    expect(document.querySelector('#welcome-heading')?.textContent).toBe(
      'Welcome',
    )
  })

  test('renders welcome message from settings', () => {
    init()

    expect(document.querySelector('#welcome-message')?.textContent).toBe(
      'to the team',
    )
  })

  test('falls back to default heading when setting is missing', () => {
    setupScreenlyMock({}, {})
    init()

    expect(document.querySelector('#welcome-heading')?.textContent).toBe(
      'Welcome',
    )
  })

  test('falls back to default message when setting is missing', () => {
    setupScreenlyMock({}, {})
    init()

    expect(document.querySelector('#welcome-message')?.textContent).toBe(
      'to the team',
    )
  })
})
