<script setup lang="ts">
import { ref, onMounted } from 'vue'

const brandLogo = ref('/src/static/img/Screenly.svg')

onMounted(async () => {
  // Brand Image Setting
  const logoUrl = screenly.settings.screenly_logo_dark || ''
  const corsUrl = screenly.cors_proxy_url + '/' + logoUrl
  const fallbackUrl = logoUrl
  const defaultLogo = '/src/static/img/Screenly.svg'

  // Function to fetch and process the image
  async function fetchImage(fileUrl: string) {
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image from ${fileUrl}, status: ${response.status}`,
        )
      }

      const blob = await response.blob()
      const buffer = await blob.arrayBuffer()
      const uintArray = new Uint8Array(buffer)

      // Get the first 4 bytes for magic number detection
      const hex = Array.from(uintArray.slice(0, 4))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()

      // Convert the first few bytes to ASCII for text-based formats like SVG
      const ascii = String.fromCharCode.apply(
        null,
        Array.from(uintArray.slice(0, 100)),
      ) // Check first 100 chars for XML/SVG tags

      // Determine file type based on MIME type, magic number, or ASCII text
      if (ascii.startsWith('<?xml') || ascii.startsWith('<svg')) {
        // Convert to Base64 and display if SVG
        const svgReader = new FileReader()
        svgReader.readAsText(blob)
        svgReader.onloadend = function () {
          const result = svgReader.result
          if (typeof result === 'string') {
            const base64 = btoa(unescape(encodeURIComponent(result)))
            brandLogo.value = 'data:image/svg+xml;base64,' + base64
          }
        }
      } else if (hex === '89504E47' || hex.startsWith('FFD8FF')) {
        // Checking PNG or JPEG/JPG magic number
        brandLogo.value = fileUrl
      } else {
        throw new Error('Unknown image type')
      }
    } catch (error) {
      console.error('Error fetching image:', error)
    }
  }

  // First, try to fetch the image using the CORS proxy URL
  try {
    await fetchImage(corsUrl)
  } catch {
    // If CORS fails, try the fallback URL
    try {
      await fetchImage(fallbackUrl)
    } catch {
      // If fallback fails, use the default logo
      brandLogo.value = defaultLogo
    }
  }
})
</script>

<template>
  <div class="info-card">
    <img :src="brandLogo" class="brand-logo" alt="Brand Logo" />
    <span class="info-text">Powered by Screenly</span>
  </div>
</template>

<style scoped lang="scss">
.info-card {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.brand-logo {
  width: 12rem;
}

.info-text {
  font-size: 1.75rem;
  color: var(--theme-color-primary);
}

/* Media Queries */
@media screen and (min-width: 480px) and (orientation: portrait) {
  .brand-logo {
    width: 5rem;
  }

  .info-text {
    font-size: 1rem;
  }

  .info-card {
    gap: 1.5rem;
  }
}

@media screen and (min-width: 720px) and (orientation: portrait) {
  .brand-logo {
    width: 9rem;
  }

  .info-text {
    font-size: 1.25rem;
  }

  .info-card {
    gap: 1.5rem;
  }
}

@media screen and (min-width: 800px) and (orientation: landscape) {
  .brand-logo {
    width: 5rem;
  }

  .info-text {
    font-size: 0.75rem;
  }

  .info-card {
    gap: 1.5rem;
  }
}

@media screen and (min-width: 1080px) and (orientation: portrait) {
  .brand-logo {
    width: 12rem;
  }

  .info-text {
    font-size: 2rem;
  }

  .info-card {
    gap: 3rem;
  }
}

@media screen and (min-width: 1280px) and (orientation: landscape) {
  .brand-logo {
    width: 8.5rem;
  }

  .info-text {
    font-size: 1.5rem;
  }

  .info-card {
    gap: 3rem;
  }
}

@media screen and (min-width: 1920px) and (orientation: landscape) {
  .brand-logo {
    width: 13rem;
  }

  .info-text {
    font-size: 1.75rem;
  }

  .info-card {
    gap: 3rem;
  }
}

@media screen and (min-width: 2160px) and (orientation: portrait) {
  .brand-logo {
    width: 22rem;
  }

  .info-text {
    font-size: 3.75rem;
  }

  .info-card {
    gap: 5rem;
  }
}

@media screen and (min-width: 3840px) and (orientation: landscape) {
  .brand-logo {
    width: 30rem;
  }

  .info-text {
    font-size: 3.75rem;
  }

  .info-card {
    gap: 5rem;
  }
}

@media screen and (min-width: 4096px) and (orientation: landscape) {
  .brand-logo {
    width: 30rem;
  }

  .info-text {
    font-size: 3.75rem;
  }

  .info-card {
    gap: 5rem;
  }
}
</style>
