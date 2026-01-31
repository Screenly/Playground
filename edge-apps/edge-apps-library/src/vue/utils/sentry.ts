import * as Sentry from '@sentry/vue'
import { getSetting } from '../../utils/settings.js'

export const initializeSentrySettings = (): void => {
  const sentryDsn = getSetting<string>('sentry_dsn')

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
    })
  } else {
    console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
  }
}
