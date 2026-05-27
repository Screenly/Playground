import bgSunny from '../static/images/bg-sunny.webp'
import bgCloudy from '../static/images/bg-cloudy.webp'
import bgRainy from '../static/images/bg-rainy.webp'
import bgSnow from '../static/images/bg-snow.webp'

// OpenWeatherMap weather condition codes:
// https://openweathermap.org/weather-conditions
//
// 2xx: Thunderstorm
// 3xx: Drizzle
// 5xx: Rain
// 6xx: Snow
// 7xx: Atmosphere (mist, fog, etc.)
// 800: Clear
// 80x: Clouds
function getBackgroundForWeatherId(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 600) {
    return bgRainy
  }

  if (weatherId >= 600 && weatherId < 700) {
    return bgSnow
  }

  if (weatherId >= 700 && weatherId < 800) {
    return bgCloudy
  }

  if (weatherId === 800) {
    return bgSunny
  }

  // 80x: Clouds
  return bgCloudy
}

export function updateBackground(weatherId: number): void {
  const bg = getBackgroundForWeatherId(weatherId)
  document.body.style.backgroundImage = `url('${bg}')`
}
