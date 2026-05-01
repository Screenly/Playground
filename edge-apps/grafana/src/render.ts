export type FetchResult =
  | { success: true }
  | { success: false; status?: number; statusText?: string; message: string }

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
): Promise<FetchResult> {
  try {
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${serviceAccessToken}`,
        'Content-Type': 'image/png',
      },
    })

    if (!response.ok) {
      const message = `HTTP ${response.status} ${response.statusText}`
      console.error(
        `Failed to fetch dashboard image from ${imageUrl}: ${message}`,
      )
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        message,
      }
    }

    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)

    if (imgElement.src.startsWith('blob:')) {
      URL.revokeObjectURL(imgElement.src)
    }

    imgElement.setAttribute('src', objectUrl)
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error fetching dashboard image:', error)
    return { success: false, message }
  }
}
