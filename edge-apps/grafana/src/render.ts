export function getRenderUrl(domain: string, dashboardId: string): string {
  const renderUrl = `${screenly.cors_proxy_url}/${domain}/render/d/${dashboardId}`
  const width = window.innerWidth|| 1920
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
): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${serviceAccessToken}`,
        'Content-Type': 'image/png',
      },
    })

    if (!response.ok) {
      console.error(
        `Failed to fetch dashboard image from ${imageUrl}: ${response.status} ${response.statusText}`,
      )
      return false
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    // Render Grafana dashboard as an image
    imgElement.setAttribute('src', objectUrl)
    return true
  } catch (error) {
    console.error('Error fetching dashboard image:', error)
    return false
  }
}
