/* global screenly */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as Sentry from '@sentry/vue'

import App from './App.vue'

const app = createApp(App)

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
