import { setupTheme, getSetting, signalReady } from '@screenly/edge-apps'

window.onload = async function () {
  // Setup branding colors using the library
  setupTheme()

  // Get settings from screenly.yml
  const domain = getSetting<string>('domain') || ''
  const dashboardId = getSetting<string>('dashboard_id') || ''
  const dashboardSlug = getSetting<string>('dashboard_slug') || ''
  const refreshInterval = getSetting<string>('refresh_interval') || '60'

  if (!domain || !dashboardId || !dashboardSlug) {
    console.error(
      'Grafana domain, dashboard ID, and dashboard slug are required',
    )
    return
  }

  // Construct the dashboard render URL
  const renderUrl = `https://${domain}/render/d/${dashboardId}/${dashboardSlug}`
  const params = new URLSearchParams({
    width: '1920',
    height: '1080',
    kiosk: 'true',
  })

  const imageUrl = `${renderUrl}?${params.toString()}`

  // Hardcoded service account token (for now)
  const token = 'glsa_fake_token_12345'

  try {
    // Make GET request to fetch the dashboard image
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'image/png',
      },
      credentials: 'omit',
    })

    if (!response.ok) {
      console.error(`Failed to fetch dashboard image: ${response.statusText}`)
      return
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    // Render Grafana dashboard as an image
    const container = document.querySelector('#content')
    if (container) {
      const img = document.createElement('img')
      img.src = objectUrl
      container.appendChild(img)
    }
  } catch (error) {
    console.error('Error fetching dashboard image:', error)
  }

  // Signal that the app is ready
  signalReady()
}
