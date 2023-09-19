/* global icons, moment */

class AppCache {
  constructor({ keyName }) {
    this.keyName = keyName;

    if (localStorage.getItem(this.keyName) === null) {
      this.data = {};
      localStorage.setItem(this.keyName, JSON.stringify(this.data));
    } else {
      this.data = JSON.parse(localStorage.getItem(this.keyName));
      console.debug('Database setup complete');
    }
  }

  clear() {
    this.data = {};
    localStorage.removeItem(this.keyName);
  }

  set(data) {
    this.data = data;
    localStorage.setItem(this.keyName, JSON.stringify(this.data));
  }

  get() {
    return this.data;
  }
}

async function getWeatherApiData(context) {
  const stringifyQueryParams = (params) => {
    return Object.entries(params).map(
      ([key, value]) => `${key}=${value}`
    ).join('&');
  };

  const endpointUrl = `https://api.openweathermap.org/data/2.5/forecast`;
  const queryParams = stringifyQueryParams({
    lat: context.lat,
    lon: context.lng,
    units: 'metric', // TODO: Make this dependent on the current location.
    cnt: 10,
    appid: context.apiKey,
  });

  let result;
  const appCache = new AppCache({ keyName: 'weather' });

  try {
    const response = await fetch(`${endpointUrl}?${queryParams}`);
    const data = await response.json();
    context.fetchError = false;

    if (data.cod !== '200') {
      throw new Error(data.message);
    }

    appCache.clear();
    const { city: { name, country, timezone }, list } = data;

    result = { name, country, timezone, list };

    appCache.set(result);
  } catch (error) {
    console.error(error);
    result = appCache.get();

    const requiredKeys = ['name', 'country', 'timezone', 'list'];
    const isComplete = requiredKeys.every((key) => {
      return result.hasOwnProperty(key);
    });

    context.fetchError = !isComplete;
  }

  return result;
}

function formatTime(today) {
  const locale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language;
  moment.locale(locale);
  return moment(today).format('LT');
}

function refreshDateTime(context) {
  clearTimeout(context.clockTimer);

  const now = moment().utcOffset(context.tzOffset);
  context.currentTime = formatTime(now);
  context.currentDate = now.format('dddd, MMM DD');

  context.clockTimer = setTimeout(
    () => refreshDateTime(context),
    context.clockTimerInterval
  );
}

function findCurrentWeatherItem(list) {
  const currentUTC = Math.round(new Date().getTime() / 1000);
  let itemIndex = 0;

  while (itemIndex < list.length - 1 && list[itemIndex].dt < currentUTC) {
    itemIndex++;
  }

  if (itemIndex > 0) {
    const timeDiffFromPrev = currentUTC - list[itemIndex - 1].dt;
    const timeDiffFromCurrent = list[itemIndex].dt - currentUTC;

    if (timeDiffFromPrev < timeDiffFromCurrent) {
      itemIndex = itemIndex - 1;
    }
  }

  return itemIndex;
}

function checkIfNight(context, dt) {
  const dateTime = moment.unix(dt).utcOffset(context.tzOffset);
  const hrs = dateTime.hour();

  return hrs <= 5 || hrs >= 20;
}

function checkIfInRange(ranges, code) {
  return ranges.reduce(
    (acc, range) => acc || (code >= range[0] && code <= range[1])
  );
}

function getWeatherImagesById(context, id = 800, dt) {
  // List of codes - https://openweathermap.org/weather-conditions
  // To do - Refactor
  const isNight = checkIfNight(context, dt);
  const hasNightBg = checkIfInRange([[200, 399], [500, 699], [800, 804]], id);
  let icon;
  let bg;

  if (id >= 200 && id <= 299) {
    icon = 'thunderstorm';
    bg = 'thunderstorm';
  }

  if (id >= 300 && id <= 399) {
    icon = 'drizzle';
    bg = 'drizzle';
  }

  if (id >= 500 && id <= 599) {
    icon = 'rain';
    bg = 'rain';
  }

  if (id >= 600 && id <= 699) {
    icon = 'snow';
    bg = 'snow';
  }

  if (id >= 700 && id <= 799) {
    // To do - Handle all 7xx cases
    icon = 'haze';

    if (id === 701 || id === 721 || id === 741) {
      bg = 'haze';
    } else if (id === 711) {
      bg = 'smoke';
    } else if (id === 731 || id === 751 || id === 761) {
      bg = 'sand';
    } else if (id === 762) {
      bg = 'volcanic-ash';
    } else if (id === 771) {
      // To do - change image squall
      bg = 'volcanic-ash';
    } else if (id === 781) {
      bg = 'tornado';
    }
  }

  if (id === 800) {
    icon = 'clear';
    bg = 'clear';
  }

  if (id === 801) {
    icon = 'partially-cloudy';
    bg = 'cloudy';
  }

  if (id >= 802 && id <= 804) {
    icon = 'mostly-cloudy';
    bg = 'cloudy';
  }

  return {
    icon: isNight ? `${icon}-night` : icon,
    bg: isNight && hasNightBg ? `${bg}-night` : bg
  };
};

/**
  * Countries using F scale
  * United States
  * Bahamas.
  * Cayman Islands.
  * Liberia.
  * Palau.
  * The Federated States of Micronesia.
  * Marshall Islands.
  */

const countriesUsingFahrenheit = ['US', 'BS', 'KY', 'LR', 'PW', 'FM', 'MH'];
const celsiusToFahrenheit = (temp) => ((1.8 * temp) + 32);
const getTemp = (context, temp) => {
  return Math.round(
    context.tempScale === 'C' ? temp : celsiusToFahrenheit(temp)
  );
};

async function refreshWeather(context) {
  clearTimeout(context.weatherTimer);

  const data = await getWeatherApiData(context);
  const { name, country, timezone: tzOffset, list } = data;

  // We only want to set these values once.
  if (!context.firstFetchComplete) {
    context.city = `${name}, ${country}`;
    context.tzOffset = parseInt(tzOffset / 60); // in minutes
    context.tempScale = countriesUsingFahrenheit.includes(country) ? 'F' : 'C';
    refreshDateTime(context);

    context.firstFetchComplete = true;
    context.isLoading = false;
  }

  const currentIndex = findCurrentWeatherItem(list);

  const { dt, weather, main: { temp } } = list[currentIndex];

  if (Array.isArray(weather) && weather.length > 0) {
    const { id, description } = weather[0];
    const { icon, bg } = getWeatherImagesById(context, id, dt);
    if (id !== context.currentWeatherId) {
      context.bgClass = `bg-${bg}`;
    }

    context.currentWeatherIcon = icons[icon];
    context.currentWeatherStatus = description;
    context.currentTemp = getTemp(context, temp);
    context.currentFormattedTempScale = `\u00B0${context.tempScale}`;

    context.currentWeatherId = id;
  }

  const windowSize = 5
  const currentWindow = list.slice(
    currentIndex,
    (currentIndex <= windowSize - 1)
      ? currentIndex + windowSize : list.length - 1,
  );

  context.forecastedItems = currentWindow.map((item, index) => {
    const { dt, main: { temp }, weather } = item;

    const { icon } = getWeatherImagesById(context, weather[0]?.id, dt);
    const dateTime = moment.unix(dt).utcOffset(context.tzOffset);

    return {
      id: index,
      temp: getTemp(context, temp),
      icon: icons[icon],
      time: index === 0 ? 'Current' : formatTime(dateTime),
    };
  });

  context.weatherTimer = setTimeout(
    () => refreshWeather(context),
    context.weatherTimerInterval
  );
};

function getWeatherData() {
  return {
    currentDate: '',
    currentTime: '',
    city: '',
    lat: 0,
    lng: 0,
    currentWeatherId: 0,
    clockTimer: null,
    clockTimerInterval: 1000,
    weatherTimer: null,
    weatherTimerInterval: 1000 * 60 * 15, // 15 minutes
    tzOffset: 0,
    bgClass: '',
    tempScale: 'C',
    currentWeatherIcon: '',
    currentWeatherStatus: '',
    currentTemp: null,
    currentFormattedTempScale: '',
    forecastedItems: [],
    fetchError: false,
    firstFetchComplete: false,
    isLoading: true,
    init: async function() {
      [this.lat, this.lng] = screenly.metadata?.coordinates;
      this.apiKey = screenly.settings.openweathermap_api_key;

      await refreshWeather(this);
    },
    settings: {},
  };
};

document.addEventListener('alpine:init', () => {
  Alpine.data('weather', getWeatherData);
});
