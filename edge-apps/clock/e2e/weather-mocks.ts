/**
 * Mock OpenWeather API responses for screenshot testing
 */

/**
 * Mock OpenWeather API response for reverse geocoding (NYC coordinates)
 */
export const mockGeocodingResponse = [
  {
    name: 'New York',
    local_names: {
      en: 'New York',
      es: 'Nueva York',
      fr: 'New York',
      zh: '纽约',
    },
    lat: 40.7128,
    lon: -74.006,
    country: 'US',
    state: 'New York',
  },
]

/**
 * Mock OpenWeather API response for current weather (NYC, clear sky, 72.5°F)
 */
export const mockWeatherResponse = {
  coord: {
    lon: -74.006,
    lat: 40.7128,
  },
  weather: [
    {
      id: 800,
      main: 'Clear',
      description: 'clear sky',
      icon: '01d',
    },
  ],
  base: 'stations',
  main: {
    temp: 72.5,
    feels_like: 71.2,
    temp_min: 68.0,
    temp_max: 75.0,
    pressure: 1013,
    humidity: 65,
    sea_level: 1013,
    grnd_level: 1010,
  },
  visibility: 10000,
  wind: {
    speed: 8.5,
    deg: 180,
  },
  clouds: {
    all: 0,
  },
  dt: 1740000000,
  sys: {
    type: 2,
    id: 2000000,
    country: 'US',
    sunrise: 1739970000,
    sunset: 1740010000,
  },
  timezone: -18000,
  id: 5128581,
  name: 'New York',
  cod: 200,
}
