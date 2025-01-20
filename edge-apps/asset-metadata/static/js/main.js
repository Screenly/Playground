/* global screenly, Sentry */
/* eslint-disable-next-line no-unused-vars, no-useless-catch */

const sentryDsn = screenly.settings.sentry_dsn
// Initiate Sentry.
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn
  })
} else {
  console.warn('Sentry DSN is not defined. Sentry will not be initialized.')
}

document.addEventListener('DOMContentLoaded', async () => {
  async function initApp () {
    const {
      coordinates,
      hostname,
      hardware,
      screenly_version: screenlyVersion,
      screen_name: screenName,
      tags
    } = screenly.metadata

    document.querySelector('.host-name-text').innerText = hostname
    document.querySelector('.screen-name-text').innerText = screenName
    document.querySelector('.hardware-name-text').innerText = hardware
    document.querySelector('.version-name-text').innerText = screenlyVersion
    document.querySelector('.coordinates-name-text').innerText = formatCoordinates(coordinates)

    // Raw Coordinates converting to formatted coordinates
    function formatCoordinates (coordinates) {
      const [lat, lng] = coordinates
      const latString = `${Math.abs(lat).toFixed(4)}\u00B0`
      const latDirection = lat > 0 ? 'N' : 'S'
      const lngString = `${Math.abs(lng).toFixed(4)}\u00B0`
      const lngDirection = lng > 0 ? 'E' : 'W'

      return `${latString} ${latDirection}, ${lngString} ${lngDirection}`
    }

    // Labels
    const labelChipContainer = document.querySelector('.label-chip-container')
    tags.forEach(label => {
      const chip = document.createElement('div')
      chip.classList.add('label-chip')
      chip.innerHTML = `<span class="label-chip-text-label">${label}</span>`
      labelChipContainer.appendChild(chip)
    })

    // constant colors
    const tertiaryColor = '#FFFFFF'
    const backgroundColor = '#C9CDD0'

    // Theme Selection
    const theme = screenly.settings.theme ? screenly.settings.theme : 'light'

    // Brand details fetching from settings
    const primaryColor = (!screenly.settings.screenly_color_accent || screenly.settings.screenly_color_accent.toLowerCase() === '#ffffff') ? '#972eff' : screenly.settings.screenly_color_accent

    let secondaryColor = '#adafbe'
    if (theme === 'light') {
      secondaryColor = (!screenly.settings.screenly_color_light || screenly.settings.screenly_color_light.toLowerCase() === '#ffffff') ? '#adafbe' : screenly.settings.screenly_color_light
    } else if (theme === 'dark') {
      secondaryColor = (!screenly.settings.screenly_color_dark || screenly.settings.screenly_color_dark.toLowerCase() === '#ffffff') ? '#adafbe' : screenly.settings.screenly_color_dark
    }

    document.documentElement.style.setProperty('--theme-color-primary', primaryColor)
    document.documentElement.style.setProperty('--theme-color-secondary', secondaryColor)
    document.documentElement.style.setProperty('--theme-color-tertiary', tertiaryColor)
    document.documentElement.style.setProperty('--theme-color-background', backgroundColor)

    // Get the logo image element
    const imgElement = document.getElementById('brand-logo')

    // Initialize variables
    let logoUrl = '' // Logo URL
    let fallbackUrl = '' // Fallback logo if CORS URL fails
    const defaultLogo = 'static/images/screenly.svg' // Fall back screenly logo

    // Define settings
    const lightLogo = screenly.settings.screenly_logo_light
    const darkLogo = screenly.settings.screenly_logo_dark

    // Set logo URLs based on theme
    if (theme === 'light') {
      logoUrl = lightLogo
        ? `${screenly.cors_proxy_url}/${lightLogo}`
        : `${screenly.cors_proxy_url}/${darkLogo}`
      fallbackUrl = lightLogo || darkLogo
    } else if (theme === 'dark') {
      logoUrl = darkLogo
        ? `${screenly.cors_proxy_url}/${darkLogo}`
        : `${screenly.cors_proxy_url}/${lightLogo}`
      fallbackUrl = darkLogo || lightLogo
    }

    // Function to fetch and process the image
    async function fetchImage (fileUrl) {
      try {
        const response = await fetch(fileUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch image from ${fileUrl}, status: ${response.status}`)
        }

        const blob = await response.blob()
        const buffer = await blob.arrayBuffer()
        const uintArray = new Uint8Array(buffer)

        // Get the first 4 bytes for magic number detection
        const hex = Array.from(uintArray.slice(0, 4))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('').toUpperCase()

        // Convert the first few bytes to ASCII for text-based formats like SVG
        const ascii = String.fromCharCode.apply(null, uintArray.slice(0, 100)) // Check first 100 chars for XML/SVG tags
        const pngMagicNumber = '89504E47'
        const jpegMagicNumber = 'FFD8FF'

        // Determine file type based on MIME type, magic number, or ASCII text
        if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
          // Convert to Base64 and display if SVG
          const svgReader = new FileReader()
          svgReader.readAsText(blob)
          svgReader.onloadend = function () {
            const base64 = btoa(unescape(encodeURIComponent(svgReader.result)))
            imgElement.src = 'data:image/svg+xml;base64,' + base64
          }
        } else if (hex === pngMagicNumber || hex === jpegMagicNumber) {
          // Checking PNG or JPEG/JPG magic number
          imgElement.src = fileUrl
        } else {
          throw new Error('Unknown image type')
        }
      } catch (error) {
        console.error('Error fetching image:', error)
        throw error
      }
    }

    // First, try to fetch the image using the CORS proxy URL
    try {
      await fetchImage(logoUrl)
    } catch (error) {
      // If CORS fails, try the fallback URL
      try {
        await fetchImage(fallbackUrl)
      } catch (fallbackError) {
        // If fallback fails, use the default logo
        imgElement.src = defaultLogo
      }
    }

    // SVG Icon color update

    function changeSvgColor (svgObject, color) {
      const svgDoc = svgObject.contentDocument
      const circle = svgDoc.querySelector('circle')
      if (circle) {
        circle.setAttribute('fill', color)
      }
    }

    const svgObjects = document.querySelectorAll('#name-icon, #hardware-icon, #version-icon, #coordinates-icon')
    svgObjects.forEach(function (svgObject) {
      if (svgObject.contentDocument) {
        changeSvgColor(svgObject, primaryColor)
      }

      svgObject.addEventListener('load', function () {
        changeSvgColor(svgObject, primaryColor)
      })
    })
  }

  try {
    await initApp()
    // Signal that the screen is ready for rendering
    screenly.signalReadyForRendering()
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
})
