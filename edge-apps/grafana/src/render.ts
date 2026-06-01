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

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
}

function extractErrorDetail(body: string, status: number): string {
  if (!body) {
    return ''
  }

  const trimmedBody = body.trim()
  const isHtml = /<!doctype html|<html[\s>]|<head[\s>]|<body[\s>]/i.test(
    trimmedBody,
  )

  if (!isHtml) {
    return trimmedBody
  }

  const titleMatch = trimmedBody.match(/<title[^>]*>(.*?)<\/title>/i)
  const title = titleMatch
    ? decodeHtmlEntities(titleMatch[1].replace(/\s+/g, ' ').trim())
    : ''
  const textContent = decodeHtmlEntities(
    trimmedBody
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
  const textWithoutTitle = title
    ? textContent.replace(title, '').replace(/\s+/g, ' ').trim()
    : textContent

  if (/forbidden/i.test(textContent)) {
    return 'Grafana returned an HTML error page instead of a dashboard image. Possible causes include missing render permissions or screenshot rendering being unavailable.'
  }

  if (status >= 500) {
    return 'Grafana returned an HTML error page instead of a dashboard image. Possible causes include screenshot rendering being unavailable or the renderer being unable to access the dashboard.'
  }

  const htmlSummary = [title, textWithoutTitle]
    .filter(Boolean)
    .join(' - ')
    .trim()

  return (
    htmlSummary || 'Grafana returned an HTML error page instead of an image.'
  )
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
    },
  })

  if (!response.ok) {
    const body = (await response.text()).trim()
    const detail = extractErrorDetail(body, response.status)
    const suffix = detail ? ` - ${detail}` : ''
    throw new Error(
      `Failed to load the Grafana dashboard image: HTTP ${response.status} ${response.statusText}${suffix}`,
    )
  }

  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)

  if (imgElement.src.startsWith('blob:')) {
    URL.revokeObjectURL(imgElement.src)
  }

  imgElement.setAttribute('src', objectUrl)
}
