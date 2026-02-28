import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

// Must be called before importing main.ts so that the global `screenly` object
// is defined before the DOMContentLoaded listener fires during module load.
setupScreenlyMock(
  {},
  { welcome_heading: 'Welcome', welcome_message: 'to the team' },
)

import init from './main.ts'

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
