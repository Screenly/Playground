import { getMetadata, getSetting } from '@screenly/edge-apps'

// Get city name from coordinates (using OpenWeatherMap reverse geocoding)
export async function getCityName(lat: number, lng: number): Promise<string> {
  try {
    const apiKey = getSetting<string>('openweathermap_api_key')
    if (!apiKey) {
      // Fallback to location from metadata if no API key
      return getMetadata().location || 'Unknown Location'
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`,
    )

    if (!response.ok) {
      console.warn(
        'Failed to get city name: OpenWeatherMap API responded with',
        response.status,
        response.statusText,
      )
      return getMetadata().location || 'Unknown Location'
    }

    const data = await response.json()

    if (Array.isArray(data) && data.length > 0) {
      const { name, country } = data[0]
      return `${name}, ${country}`
    }
  } catch (error) {
    console.warn('Failed to get city name:', error)
  }

  // Fallback to location from metadata
  return getMetadata().location || 'Unknown Location'
}
