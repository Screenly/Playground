/* global icons, moment */

async function getWeatherApiData(apiKey, lat, lng) {
  const stringifyQueryParams = (params) => {
    return Object.entries(params).map(
      ([key, value]) => `${key}=${value}`
    ).join('&');
  };

  const endpointUrl = `https://api.openweathermap.org/data/2.5/forecast`;
  const queryParams = stringifyQueryParams({
    lat: lat,
    lon: lng,
    units: 'metric', // TODO: Make this dependent on the current location.
    cnt: 10,
    appid: apiKey,
  });

  const response = await fetch(`${endpointUrl}?${queryParams}`);
  return await response.json();
}

function formatTime(today) {
  const locale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language
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

async function refreshWeather(context) {
  clearTimeout(context.weatherTimer);

  const data = await getWeatherApiData(context.apiKey, context.lat, context.lng);

  // nico start - new block of code
  const { list } = data
  const currentIndex = findCurrentWeatherItem(list)

  const { dt, weather, main: { temp } } = list[currentIndex]

  if (Array.isArray(weather) && weather.length > 0) {
    const { id, description } = weather[0]
    const { icon, bg } = getWeatherImagesById(id, dt)
    if (id !== currentWeatherId) {
      loadBackground(bg)
    }

    updateCurrentWeather(icon, description, temp)
    currentWeatherId = id
  }

  // const weatherListContainer = document.querySelector('#weather-item-list')
  // const frag = document.createDocumentFragment()
  // const windowSize = 5
  // const currentWindow = list.slice(currentIndex, currentIndex <= windowSize - 1 ? currentIndex + windowSize : list.length - 1)
  // currentWindow.forEach((item, index) => {
  //   const { dt, main: { temp }, weather } = item

  //   const { icon } = getWeatherImagesById(weather[0]?.id, dt)
  //   const dateTime = moment.unix(dt).utcOffset(tz)

  //   const dummyNode = document.querySelector('.dummy-node')
  //   const node = dummyNode.cloneNode(true)
  //   node.classList.remove('dummy-node')
  //   node.querySelector('.item-temp').innerText = getTemp(temp)
  //   node.querySelector('.item-icon').setAttribute('src', icons[icon])
  //   node.querySelector('.item-time').innerText = index === 0 ? 'Current' : formatTime(dateTime)

  //   frag.appendChild(node)
  // })

  // weatherListContainer.innerHTML = ''
  // weatherListContainer.appendChild(frag)
  // nico end

  context.weatherTimer = setTimeout(
    () => refreshWeather(context),
    context.weatherTimerInterval
  );
}

const getWeatherData = function() {
  return {
    currentDate: '',
    currentTime: '',
    city: '',
    lat: 0,
    lng: 0,
    clockTimer: null,
    clockTimerInterval: 1000,
    weatherTimer: null,
    weatherTimerInterval: 1000 * 60 * 5, // todo nico: change to 60000
    tzOffset: 0,
    init: async function() {
      [this.lat, this.lng] = screenly.metadata?.coordinates || screenly?.coordinates;
      this.apiKey = screenly.settings.openweathermap_api_key;

      const data = await getWeatherApiData(this.apiKey, this.lat, this.lng);
      const { city: { name, country, timezone: tzOffset }, list } = data;

      this.city = `${name}, ${country}`;
      this.tzOffset = parseInt(tzOffset / 60); // in minutes
      refreshDateTime(this);

      // TODO: Dummy data. Replace with real data.
      await refreshWeather(this);
    },
    settings: {},
  };
};

document.addEventListener('alpine:init', () => {
  Alpine.data('weather', getWeatherData);
});
