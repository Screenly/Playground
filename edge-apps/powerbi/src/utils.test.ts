import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test'
import {
  getEmbedTypeFromUrl,
  getErrorBackoffSec,
  getRefreshDelaySec,
  getTokenRefreshInterval,
} from './utils'

const NOW_MS = 1_700_000_000_000
const MAX_INTERVAL_SEC = 300

function isoFromNow(offsetSec: number): string {
  return new Date(NOW_MS + offsetSec * 1000).toISOString()
}

// eslint-disable-next-line max-lines-per-function
describe('utils', () => {
  describe('getRefreshDelaySec', () => {
    let nowSpy: ReturnType<typeof spyOn>

    beforeEach(() => {
      nowSpy = spyOn(Date, 'now').mockReturnValue(NOW_MS)
    })

    afterEach(() => {
      nowSpy.mockRestore()
    })

    it('when 60% of token lifetime exceeds interval, should cap at interval', () => {
      expect(getRefreshDelaySec(isoFromNow(3600), 60)).toBe(60)
    })

    it('when 60% of token lifetime is below interval, should schedule from lifetime', () => {
      expect(getRefreshDelaySec(isoFromNow(200), MAX_INTERVAL_SEC)).toBeCloseTo(
        120,
        5,
      )
    })

    it('when 60% of token lifetime falls below floor, should return floor delay', () => {
      expect(getRefreshDelaySec(isoFromNow(15), MAX_INTERVAL_SEC)).toBe(10)
    })

    it('when token already expired, should return floor delay', () => {
      expect(getRefreshDelaySec(isoFromNow(-100), MAX_INTERVAL_SEC)).toBe(10)
    })

    it('when expiration is null, should fall back to interval', () => {
      expect(getRefreshDelaySec(null, MAX_INTERVAL_SEC)).toBe(300)
    })

    it('when expiration is unparseable, should fall back to interval', () => {
      expect(getRefreshDelaySec('not-a-date', MAX_INTERVAL_SEC)).toBe(300)
    })
  })

  describe('getErrorBackoffSec', () => {
    it('when error step is zero, should return initial backoff', () => {
      expect(getErrorBackoffSec(0, MAX_INTERVAL_SEC)).toBe(15)
    })

    it('when error step increases, should back off exponentially', () => {
      expect(getErrorBackoffSec(3, MAX_INTERVAL_SEC)).toBe(120)
    })

    it('when backoff exceeds interval, should cap at interval', () => {
      expect(getErrorBackoffSec(5, MAX_INTERVAL_SEC)).toBe(300)
    })

    it('when error step exceeds maximum, should plateau', () => {
      expect(getErrorBackoffSec(9, 100_000)).toBe(1920)
    })
  })

  describe('getTokenRefreshInterval', () => {
    afterEach(() => {
      delete (globalThis as Record<string, unknown>).screenly
    })

    function setRefreshInterval(value: string | undefined) {
      ;(globalThis as Record<string, unknown>).screenly = {
        settings: { refresh_interval: value },
      }
    }

    it('when refresh_interval within range, should return it in seconds', () => {
      setRefreshInterval('3')

      expect(getTokenRefreshInterval()).toBe(180)
    })

    it('when refresh_interval equals minimum, should return it in seconds', () => {
      setRefreshInterval('1')

      expect(getTokenRefreshInterval()).toBe(60)
    })

    it('when refresh_interval below minimum, should fall back to maximum', () => {
      setRefreshInterval('0')

      expect(getTokenRefreshInterval()).toBe(300)
    })

    it('when refresh_interval above maximum, should fall back to maximum', () => {
      setRefreshInterval('10')

      expect(getTokenRefreshInterval()).toBe(300)
    })

    it('when refresh_interval not numeric, should fall back to maximum', () => {
      setRefreshInterval('abc')

      expect(getTokenRefreshInterval()).toBe(300)
    })

    it('when refresh_interval unset, should fall back to maximum', () => {
      setRefreshInterval(undefined)

      expect(getTokenRefreshInterval()).toBe(300)
    })
  })

  describe('getEmbedTypeFromUrl', () => {
    it('when url is dashboard embed, should return dashboard', () => {
      expect(
        getEmbedTypeFromUrl(
          'https://app.powerbi.com/dashboardEmbed?dashboardId=abc&groupId=def',
        ),
      ).toBe('dashboard')
    })

    it('when url is report embed, should return report', () => {
      expect(
        getEmbedTypeFromUrl(
          'https://app.powerbi.com/reportEmbed?reportId=abc&groupId=def',
        ),
      ).toBe('report')
    })
  })
})
