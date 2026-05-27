import '@screenly/edge-apps/test'
import { describe, test, expect, beforeEach } from 'bun:test'
import { createProgressRingSVG, updateProgressRing } from './progress-ring'

describe('createProgressRingSVG', () => {
  test('creates SVG element with correct attributes', () => {
    const svg = createProgressRingSVG(400)

    expect(svg).toBeInstanceOf(SVGSVGElement)
    expect(svg.getAttribute('width')).toBe('400')
    expect(svg.getAttribute('height')).toBe('400')
    expect(svg.getAttribute('viewBox')).toBe('0 0 400 400')
  })

  test('creates exactly 60 tick lines', () => {
    const svg = createProgressRingSVG(400)
    const ticks = svg.querySelectorAll('line[data-tick]')

    expect(ticks.length).toBe(60)
  })

  test('each tick has required attributes', () => {
    const svg = createProgressRingSVG(400)
    const ticks = svg.querySelectorAll('line[data-tick]')

    ticks.forEach((tick, i) => {
      expect(tick.getAttribute('data-tick')).toBe(String(i))
      expect(tick.getAttribute('stroke')).toBe('rgba(255, 255, 255, 0.8)')
      expect(tick.getAttribute('stroke-width')).toBe('6')
      expect(tick.getAttribute('stroke-linecap')).toBe('butt')
      expect(tick.getAttribute('x1')).not.toBeNull()
      expect(tick.getAttribute('y1')).not.toBeNull()
      expect(tick.getAttribute('x2')).not.toBeNull()
      expect(tick.getAttribute('y2')).not.toBeNull()
    })
  })

  test('creates SVG with different diameter', () => {
    const svg = createProgressRingSVG(500)

    expect(svg.getAttribute('width')).toBe('500')
    expect(svg.getAttribute('height')).toBe('500')
    expect(svg.getAttribute('viewBox')).toBe('0 0 500 500')
  })
})

describe('updateProgressRing', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = createProgressRingSVG(400)
    // Set up CSS custom property for theme color
    document.documentElement.style.setProperty(
      '--theme-color-primary',
      '#ac1fff',
    )
  })

  test('no progress (0%) - all ticks remain default color', () => {
    updateProgressRing(svg, 0)
    const ticks = svg.querySelectorAll('line[data-tick]')

    ticks.forEach((tick) => {
      expect(tick.getAttribute('stroke')).toBe('rgba(255, 255, 255, 0.8)')
    })
  })

  test('half progress (50%) - first 30 ticks colored', () => {
    updateProgressRing(svg, 0.5)
    const ticks = svg.querySelectorAll('line[data-tick]')

    for (let i = 0; i < 30; i++) {
      expect(ticks[i].getAttribute('stroke')).toBe('#ac1fff')
    }
    for (let i = 30; i < 60; i++) {
      expect(ticks[i].getAttribute('stroke')).toBe('rgba(255, 255, 255, 0.8)')
    }
  })

  test('full progress (100%) - all ticks colored', () => {
    updateProgressRing(svg, 1)
    const ticks = svg.querySelectorAll('line[data-tick]')

    ticks.forEach((tick) => {
      expect(tick.getAttribute('stroke')).toBe('#ac1fff')
    })
  })

  test('partial progress (25%) - first 15 ticks colored', () => {
    updateProgressRing(svg, 0.25)
    const ticks = svg.querySelectorAll('line[data-tick]')

    for (let i = 0; i < 15; i++) {
      expect(ticks[i].getAttribute('stroke')).toBe('#ac1fff')
    }
    for (let i = 15; i < 60; i++) {
      expect(ticks[i].getAttribute('stroke')).toBe('rgba(255, 255, 255, 0.8)')
    }
  })

  test('progress beyond 100% is handled', () => {
    updateProgressRing(svg, 1.5)
    const ticks = svg.querySelectorAll('line[data-tick]')

    // Should color all 60 ticks
    ticks.forEach((tick) => {
      expect(tick.getAttribute('stroke')).toBe('#ac1fff')
    })
  })

  test('uses custom theme color if available', () => {
    document.documentElement.style.setProperty(
      '--theme-color-primary',
      '#ff0000',
    )
    updateProgressRing(svg, 0.5)
    const ticks = svg.querySelectorAll('line[data-tick]')

    expect(ticks[0].getAttribute('stroke')).toBe('#ff0000')
  })

  test('falls back to default color if theme not set', () => {
    document.documentElement.style.removeProperty('--theme-color-primary')
    updateProgressRing(svg, 0.5)
    const ticks = svg.querySelectorAll('line[data-tick]')

    // Should use fallback color
    expect(ticks[0].getAttribute('stroke')).toBe('#ac1fff')
  })
})
