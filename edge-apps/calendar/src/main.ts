import '@/assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'
import panic from 'panic-overlay'

import App from './App.vue'

const displayErrors = screenly.settings.display_errors === 'true' || false

const app = createApp(App)

if (displayErrors) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.config.errorHandler = (err, instance, info) => {
    panic(err instanceof Error ? err : new Error(String(err)))
  }
}

// Initialize Sentry if DSN is provided
const sentryDsn = screenly.settings.sentry_dsn
if (sentryDsn) {
  Sentry.init({
    app,
    dsn: sentryDsn as string,
  })
}

app.use(createPinia())

app.mount('#app')
