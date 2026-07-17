/* global screenly */

document.addEventListener('DOMContentLoaded', async () => {
  const settings = screenly.settings
  const url = settings.dashboard_url

  if (!url) {
    console.error('Please specify a dashboard URL')
    return
  }

  document.getElementById('dashboard').src = url
  screenly.signalReadyForRendering()
})
