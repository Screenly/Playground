export function getRenderUrl(domain: string, dashboardId: string): string {
  const renderUrl = `${screenly.cors_proxy_url}/https://${domain}/render/d/${dashboardId}`
  const width = window.innerWidth || 1920
  const height = window.innerHeight || 1080
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    kiosk: 'true',
  })

  return `${renderUrl}?${params.toString()}`
}

export async function fetchAndRenderDashboard(
  imageUrl: string,
  serviceAccessToken: string,
  imgElement: HTMLImageElement,
): Promise<void> {
  try {
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${serviceAccessToken}`,
        'Content-Type': 'image/png',
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch dashboard image: ${response.statusText}`)
      return
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    // Render Grafana dashboard as an image
    imgElement.setAttribute('src', objectUrl)
  } catch (error) {
    console.error('Error fetching dashboard image:', error)
  }
}
