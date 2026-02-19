/* eslint-disable max-lines */
/**
 * Mock OpenWeather API responses for screenshot testing
 */

/**
 * Mock OpenWeather API response for reverse geocoding (Mountain View, CA)
 */
export const mockGeocodingResponse = [
  {
    name: 'Mountain View',
    local_names: {
      en: 'Mountain View',
      ru: 'Маунтин-Вью',
      zh: '山景城',
      ar: 'مونتن فيو',
    },
    lat: 37.3893889,
    lon: -122.0832101,
    country: 'US',
    state: 'California',
  },
]

/**
 * Mock OpenWeather API response for current weather (Mountain View, light rain, 53°F)
 */
export const mockWeatherResponse = {
  coord: {
    lon: -122.0839,
    lat: 37.3861,
  },
  weather: [
    {
      id: 500,
      main: 'Rain',
      description: 'light rain',
      icon: '10d',
    },
  ],
  base: 'stations',
  main: {
    temp: 53,
    feels_like: 51.2,
    temp_min: 50.5,
    temp_max: 55.8,
    pressure: 1010,
    humidity: 88,
    sea_level: 1010,
    grnd_level: 988,
  },
  visibility: 6000,
  wind: {
    speed: 9.2,
    deg: 230,
    gust: 16.5,
  },
  clouds: {
    all: 95,
  },
  dt: 1771457067,
  sys: {
    type: 2,
    id: 2105119,
    country: 'US',
    sunrise: 1771426439,
    sunset: 1771465849,
  },
  timezone: -28800,
  id: 5375480,
  name: 'Mountain View',
  cod: 200,
}

/**
 * Mock OpenWeather API response for 7-day forecast (Mountain View)
 */
export const mockForecastResponse = {
  cod: '200',
  message: 0,
  cnt: 7,
  list: [
    {
      dt: 1771459200,
      main: {
        temp: 49.87,
        feels_like: 46.83,
        temp_min: 46.44,
        temp_max: 49.87,
        pressure: 1014,
        sea_level: 1014,
        grnd_level: 993,
        humidity: 81,
        temp_kf: 1.91,
      },
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10d',
        },
      ],
      clouds: {
        all: 75,
      },
      wind: {
        speed: 7.45,
        deg: 253,
        gust: 13.87,
      },
      visibility: 10000,
      pop: 1,
      rain: {
        '3h': 1.64,
      },
      sys: {
        pod: 'd',
      },
      dt_txt: '2026-02-19 00:00:00',
    },
    {
      dt: 1771470000,
      main: {
        temp: 47.84,
        feels_like: 46.45,
        temp_min: 43.79,
        temp_max: 47.84,
        pressure: 1014,
        sea_level: 1014,
        grnd_level: 993,
        humidity: 83,
        temp_kf: 2.25,
      },
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10n',
        },
      ],
      clouds: {
        all: 83,
      },
      wind: {
        speed: 3.89,
        deg: 177,
        gust: 4.59,
      },
      visibility: 10000,
      pop: 1,
      rain: {
        '3h': 0.95,
      },
      sys: {
        pod: 'n',
      },
      dt_txt: '2026-02-19 03:00:00',
    },
    {
      dt: 1771480800,
      main: {
        temp: 44.76,
        feels_like: 41.34,
        temp_min: 42.21,
        temp_max: 44.76,
        pressure: 1014,
        sea_level: 1014,
        grnd_level: 992,
        humidity: 89,
        temp_kf: 1.42,
      },
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10n',
        },
      ],
      clouds: {
        all: 91,
      },
      wind: {
        speed: 6.15,
        deg: 140,
        gust: 10.65,
      },
      visibility: 10000,
      pop: 1,
      rain: {
        '3h': 0.23,
      },
      sys: {
        pod: 'n',
      },
      dt_txt: '2026-02-19 06:00:00',
    },
    {
      dt: 1771491600,
      main: {
        temp: 43.27,
        feels_like: 40.98,
        temp_min: 43.27,
        temp_max: 43.27,
        pressure: 1011,
        sea_level: 1011,
        grnd_level: 989,
        humidity: 97,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10n',
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 4.14,
        deg: 128,
        gust: 12.35,
      },
      visibility: 5945,
      pop: 1,
      rain: {
        '3h': 1.9,
      },
      sys: {
        pod: 'n',
      },
      dt_txt: '2026-02-19 09:00:00',
    },
    {
      dt: 1771502400,
      main: {
        temp: 41.13,
        feels_like: 33.84,
        temp_min: 41.13,
        temp_max: 41.13,
        pressure: 1007,
        sea_level: 1007,
        grnd_level: 985,
        humidity: 97,
        temp_kf: 0,
      },
      weather: [
        {
          id: 502,
          main: 'Rain',
          description: 'heavy intensity rain',
          icon: '10n',
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 13.22,
        deg: 136,
        gust: 26.73,
      },
      visibility: 9900,
      pop: 1,
      rain: {
        '3h': 12.52,
      },
      sys: {
        pod: 'n',
      },
      dt_txt: '2026-02-19 12:00:00',
    },
    {
      dt: 1771513200,
      main: {
        temp: 47.82,
        feels_like: 42.6,
        temp_min: 47.82,
        temp_max: 47.82,
        pressure: 1003,
        sea_level: 1003,
        grnd_level: 981,
        humidity: 92,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10d',
        },
      ],
      clouds: {
        all: 100,
      },
      wind: {
        speed: 12.26,
        deg: 234,
        gust: 23.49,
      },
      visibility: 10000,
      pop: 0.89,
      rain: {
        '3h': 0.64,
      },
      sys: {
        pod: 'd',
      },
      dt_txt: '2026-02-19 15:00:00',
    },
    {
      dt: 1771524000,
      main: {
        temp: 44.64,
        feels_like: 38.43,
        temp_min: 44.64,
        temp_max: 44.64,
        pressure: 1009,
        sea_level: 1009,
        grnd_level: 987,
        humidity: 83,
        temp_kf: 0,
      },
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10d',
        },
      ],
      clouds: {
        all: 99,
      },
      wind: {
        speed: 12.77,
        deg: 284,
        gust: 29.01,
      },
      visibility: 10000,
      pop: 1,
      rain: {
        '3h': 1.91,
      },
      sys: {
        pod: 'd',
      },
      dt_txt: '2026-02-19 18:00:00',
    },
  ],
  city: {
    id: 5375480,
    name: 'Mountain View',
    coord: {
      lat: 37.3861,
      lon: -122.0839,
    },
    country: 'US',
    population: 74066,
    timezone: -28800,
    sunrise: 1771426439,
    sunset: 1771465849,
  },
}
