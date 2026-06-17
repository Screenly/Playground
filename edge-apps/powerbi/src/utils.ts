import {
  INITIAL_ERROR_BACKOFF_SECONDS,
  MAX_ERROR_BACKOFF_STEP,
  MAX_REFRESH_INTERVAL_MINUTES,
  MIN_REFRESH_DELAY_SECONDS,
  MIN_REFRESH_INTERVAL_MINUTES,
  TOKEN_REFRESH_LIFETIME_FRACTION,
} from './utils.lib'

export function getTokenRefreshInterval(): number {
  const intervalMinutes = parseInt(screenly.settings.refresh_interval, 10)
  if (
    isNaN(intervalMinutes) ||
    intervalMinutes < MIN_REFRESH_INTERVAL_MINUTES
  ) {
    return MAX_REFRESH_INTERVAL_MINUTES * 60
  }
  if (intervalMinutes > MAX_REFRESH_INTERVAL_MINUTES) {
    return MAX_REFRESH_INTERVAL_MINUTES * 60
  }
  return intervalMinutes * 60
}

export function getRefreshDelaySec(
  expiration: string | null,
  maxIntervalSec: number,
): number {
  const expiresAtMs = Date.parse(expiration as string)
  if (isNaN(expiresAtMs)) {
    return maxIntervalSec
  }

  const remainingSec = (expiresAtMs - Date.now()) / 1000
  const lifetimeBasedSec = remainingSec * TOKEN_REFRESH_LIFETIME_FRACTION

  return Math.max(
    MIN_REFRESH_DELAY_SECONDS,
    Math.min(maxIntervalSec, lifetimeBasedSec),
  )
}

export function getErrorBackoffSec(
  errorStep: number,
  maxIntervalSec: number,
): number {
  const cappedStep = Math.min(errorStep, MAX_ERROR_BACKOFF_STEP)
  const backoffSec = INITIAL_ERROR_BACKOFF_SECONDS * Math.pow(2, cappedStep)

  return Math.min(backoffSec, maxIntervalSec)
}

export function getEmbedTypeFromUrl(url: string): 'dashboard' | 'report' {
  if (url.indexOf('/dashboard') !== -1) {
    return 'dashboard'
  }

  return 'report'
}
