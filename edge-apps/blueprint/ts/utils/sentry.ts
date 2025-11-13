/* global screenly */

import * as Sentry from '@sentry/vue'

export const initializeSentrySettings = (): void => {
  const sentryDsn = screenly.settings.sentry_dsn

  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn as string,
    })
  } else {
    console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
  }
}
