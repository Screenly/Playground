import QRCode from 'qrcode'

declare global {
  interface Window {
    screenly: {
      settings: {
        url: string
        enable_utm: string
        headline: string
        call_to_action: string
        screenly_color_accent?: string
        screenly_color_light?: string
        screenly_color_dark?: string
      }
      metadata: {
        location: string
        hostname: string
      }
      signalReadyForRendering: () => void
    }
  }
}

interface QRCodeOptions {
  type: 'svg'
  color?: {
    light?: string
    dark?: string
  }
  margin?: number
}

function generateQrCode(
  url: string,
  options: QRCodeOptions,
  enableUtm: boolean,
  callback: (svgElement: SVGElement) => void
): void {
  const handleUrl = (url: string): string => {
    if (!enableUtm) return url
    const { location, hostname } = window.screenly.metadata
    const queryParams = {
      utm_source: 'screenly',
      utm_medium: 'digital-signage',
      utm_location: encodeURIComponent(location),
      utm_placement: encodeURIComponent(hostname),
    }

    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    return `${url}?${queryString}`
  }

  QRCode.toString(handleUrl(url), options, (err, result) => {
    if (err) throw err

    const parser = new DOMParser()
    const svg = parser.parseFromString(result, 'image/svg+xml')

    callback(svg.documentElement as unknown as SVGElement)
  })
}

function setupBrandingColors() {
  const settings = window.screenly.settings
  const defaultPrimaryColor = '#972EFF'

  const primaryColor =
    !settings.screenly_color_accent ||
    settings.screenly_color_accent.toLowerCase() === '#ffffff'
      ? defaultPrimaryColor
      : settings.screenly_color_accent

  document.documentElement.style.setProperty('--theme-color-primary', primaryColor)
  document.documentElement.style.setProperty('--theme-color-tertiary', '#FFFFFF')
  document.documentElement.style.setProperty('--theme-color-background', '#C9CDD0')
}

window.onload = function () {
  const { url, enable_utm, headline, call_to_action } = window.screenly.settings

  // Setup branding colors
  setupBrandingColors()

  // Set the headline (main message)
  const headlineElement = document.querySelector<HTMLHeadingElement>('#headline')
  if (headlineElement && headline) {
    headlineElement.textContent = headline
  }

  // Set the call to action (instruction)
  const ctaElement = document.querySelector<HTMLParagraphElement>('#cta')
  if (ctaElement && call_to_action) {
    ctaElement.textContent = call_to_action
  }

  generateQrCode(
    url,
    {
      type: 'svg',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      margin: 2,
    },
    enable_utm === 'true',
    (svgElement) => {
      const container = document.querySelector('#qr-code')
      container?.appendChild(svgElement)

      // Signal that the app is ready
      window.screenly.signalReadyForRendering()
    }
  )
}
