import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

// Must be called before importing main.ts so that the global `screenly` object
// is defined before the DOMContentLoaded listener fires during module load.
setupScreenlyMock()

import init from './main'

const DEFAULT_BODY =
  'A simple message app allows users to display text on a screen, making it a\nbasic tool for digital signage. Users can input and edit both the heading\nand message body directly from the Screenly dashboard.\n'

describe('Simple Message App', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <h1 id="message-header"></h1>
      <div id="message-body"></div>
      <div id="date-badge"></div>
    `

    setupScreenlyMock(
      {},
      {
        message_header: 'Simple Message App',
        message_body: 'Hello, World!',
      },
    )
  })

  afterEach(() => {
    resetScreenlyMock()
    document.body.innerHTML = ''
  })

  test('renders message header from settings', async () => {
    await init()

    expect(document.querySelector('#message-header')?.textContent).toBe(
      'Simple Message App',
    )
  })

  test('renders message body from settings', async () => {
    await init()

    expect(document.querySelector('#message-body')?.textContent).toBe(
      'Hello, World!',
    )
  })

  test('renders date badge', async () => {
    await init()

    expect(document.querySelector('#date-badge')?.textContent).not.toBeEmpty()
  })

  test('falls back to default header when setting is missing', async () => {
    setupScreenlyMock({}, {})
    await init()

    expect(document.querySelector('#message-header')?.textContent).toBe(
      'Simple Message App',
    )
  })

  test('falls back to default body when setting is missing', async () => {
    setupScreenlyMock({}, {})
    await init()

    expect(document.querySelector('#message-body')?.textContent).toBe(
      DEFAULT_BODY,
    )
  })
})
