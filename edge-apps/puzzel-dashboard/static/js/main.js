/* global screenly */

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await screenly.settings
  const url = settings.dashboard_url

  if (url) {
    document.getElementById('dashboard').src = url
  }

  screenly.signalReadyForRendering()
})
