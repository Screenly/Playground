import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { setupScreenlyMock, resetScreenlyMock } from '@screenly/edge-apps/test'

import init from './app'

describe('Asset Metadata', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="hostname"></div>
      <div id="screen-name"></div>
      <div id="hardware"></div>
      <div id="version"></div>
      <div id="coordinates"></div>
      <div id="labels"></div>
    `

    setupScreenlyMock({
      hostname: 'srly-abc123',
      screen_name: 'Lobby Display',
      hardware: 'rpi4',
      screenly_version: '2.0.0',
      coordinates: [40.7128, -74.006],
      tags: ['lobby', 'floor-1'],
    })
  })

  afterEach(() => {
    resetScreenlyMock()
    document.body.innerHTML = ''
  })

  test('renders hostname', async () => {
    await init()
    expect(document.querySelector('#hostname')?.textContent).toBe('srly-abc123')
  })

  test('renders screen name', async () => {
    await init()
    expect(document.querySelector('#screen-name')?.textContent).toBe(
      'Lobby Display',
    )
  })

  test('renders hardware', async () => {
    await init()
    expect(document.querySelector('#hardware')?.textContent).toBe('rpi4')
  })

  test('renders version', async () => {
    await init()
    expect(document.querySelector('#version')?.textContent).toBe('2.0.0')
  })

  test('renders coordinates', async () => {
    await init()
    expect(document.querySelector('#coordinates')?.textContent).toBe(
      '40.7128° N, 74.0060° W',
    )
  })

  test('renders label chips', async () => {
    await init()
    const chips = document.querySelectorAll('#labels .label-chip')
    expect(chips).toHaveLength(2)
    expect(chips[0].textContent).toBe('lobby')
    expect(chips[1].textContent).toBe('floor-1')
  })

  test('renders no-labels message when tags are empty', async () => {
    setupScreenlyMock({ tags: [] })
    await init()
    expect(document.querySelector('#labels .no-labels')?.textContent).toBe(
      'No labels assigned',
    )
  })

  test('escapes HTML in label chips', async () => {
    setupScreenlyMock({ tags: ['<script>alert("xss")</script>'] })
    await init()
    const chip = document.querySelector('#labels .label-chip')
    expect(chip?.textContent).toBe('<script>alert("xss")</script>')
    expect(chip?.innerHTML).not.toContain('<script>')
  })
})
