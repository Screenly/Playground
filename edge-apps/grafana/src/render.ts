export function getRenderUrl(domain: string, dashboardId: string): string {
  const renderUrl = `${screenly.cors_proxy_url}/${domain}/render/d/${dashboardId}`
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
  const response = await fetch(imageUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${serviceAccessToken}`,
      'Content-Type': 'image/png',
    },
  })

  if (!response.ok) {
    const body = (await response.text()).trim()
    const detail = body ? ` - ${body}` : ''
    throw new Error(
      `Failed to load the Grafana dashboard image: HTTP ${response.status} ${response.statusText}${detail}`,
    )
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  if (imgElement.src.startsWith('blob:')) {
    URL.revokeObjectURL(imgElement.src)
  }

  imgElement.setAttribute('src', objectUrl)
}
