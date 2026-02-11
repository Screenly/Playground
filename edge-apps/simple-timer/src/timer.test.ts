import { describe, test, expect } from 'bun:test'
import { createTimerState, formatTotalLabel, padTwo } from './timer'

describe('padTwo', () => {
  test('pads single digit numbers', () => {
    expect(padTwo(0)).toBe('00')
    expect(padTwo(5)).toBe('05')
    expect(padTwo(9)).toBe('09')
  })

  test('does not pad double digit numbers', () => {
    expect(padTwo(10)).toBe('10')
    expect(padTwo(59)).toBe('59')
  })
})

describe('formatTotalLabel', () => {
  test('formats seconds', () => {
    expect(formatTotalLabel(1)).toBe('Total 1 Second')
    expect(formatTotalLabel(30)).toBe('Total 30 Seconds')
    expect(formatTotalLabel(59)).toBe('Total 59 Seconds')
  })

  test('formats minutes', () => {
    expect(formatTotalLabel(60)).toBe('Total 1 Minute')
    expect(formatTotalLabel(300)).toBe('Total 5 Minutes')
    expect(formatTotalLabel(600)).toBe('Total 10 Minutes')
  })

  test('formats mixed minutes and seconds', () => {
    expect(formatTotalLabel(90)).toBe('Total 1m 30s')
    expect(formatTotalLabel(125)).toBe('Total 2m 5s')
  })

  test('formats hours', () => {
    expect(formatTotalLabel(3600)).toBe('Total 1 Hour')
    expect(formatTotalLabel(7200)).toBe('Total 2 Hours')
  })

  test('formats mixed hours and minutes', () => {
    expect(formatTotalLabel(5400)).toBe('Total 1h 30m')
  })
})

describe('createTimerState', () => {
  test('full remaining (elapsed=0)', () => {
    const state = createTimerState(60, 0)
    expect(state.remainingSeconds).toBe(60)
    expect(state.elapsedSeconds).toBe(0)
    expect(state.progress).toBe(0)
    expect(state.hours).toBe('00')
    expect(state.minutes).toBe('01')
    expect(state.seconds).toBe('00')
    expect(state.finished).toBe(false)
  })

  test('half elapsed', () => {
    const state = createTimerState(60, 30)
    expect(state.remainingSeconds).toBe(30)
    expect(state.progress).toBe(0.5)
    expect(state.hours).toBe('00')
    expect(state.minutes).toBe('00')
    expect(state.seconds).toBe('30')
    expect(state.finished).toBe(false)
  })

  test('fully elapsed', () => {
    const state = createTimerState(60, 60)
    expect(state.remainingSeconds).toBe(0)
    expect(state.progress).toBe(1)
    expect(state.hours).toBe('00')
    expect(state.minutes).toBe('00')
    expect(state.seconds).toBe('00')
    expect(state.finished).toBe(true)
  })

  test('elapsed exceeds total is clamped', () => {
    const state = createTimerState(60, 100)
    expect(state.remainingSeconds).toBe(0)
    expect(state.elapsedSeconds).toBe(60)
    expect(state.progress).toBe(1)
    expect(state.finished).toBe(true)
  })

  test('hours/minutes/seconds digit formatting for large duration', () => {
    const state = createTimerState(3661, 0)
    expect(state.hours).toBe('01')
    expect(state.minutes).toBe('01')
    expect(state.seconds).toBe('01')
  })

  test('1 second duration', () => {
    const state = createTimerState(1, 0)
    expect(state.remainingSeconds).toBe(1)
    expect(state.hours).toBe('00')
    expect(state.minutes).toBe('00')
    expect(state.seconds).toBe('01')
    expect(state.totalLabel).toBe('Total 1 Second')
    expect(state.finished).toBe(false)
  })

  test('1 second duration fully elapsed', () => {
    const state = createTimerState(1, 1)
    expect(state.remainingSeconds).toBe(0)
    expect(state.finished).toBe(true)
  })

  test('zero duration', () => {
    const state = createTimerState(0, 0)
    expect(state.progress).toBe(1)
    expect(state.finished).toBe(true)
  })
})
