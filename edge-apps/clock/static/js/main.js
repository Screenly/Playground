/* global clm, moment, OfflineGeocodeCity */
// eslint-disable-next-line no-unused-vars

const { getNearestCity } = OfflineGeocodeCity;

async function initApp () {
  let clockTimer;
  const { metadata, settings } = screenly;
  const latitude = metadata.coordinates[0];
  const longitude = metadata.coordinates[1];

  const defaultLocale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language;

  const formatTime = async (momentObject) => {
    const data = getNearestCity(latitude, longitude);
    const countryCode = data.countryIso2.toUpperCase();
    const locale = clm.getLocaleByAlpha2(countryCode) || defaultLocale;

    moment.locale(locale);
    const time = momentObject.format('LT');
    const timeFragments = time.split(' ');

    return Array.isArray(timeFragments) && timeFragments.length === 2
      ? `${timeFragments[0]}<span>${timeFragments[1]}</span>`
      : time;
  }

  const initDateTime = async () => {
    clearTimeout(clockTimer);

    const timezone = settings?.override_timezone || tzlookup(latitude, longitude);
    const momentObject = moment().tz(timezone);

    document.querySelector('#date').innerText = momentObject.format('LL');
    document.querySelector('#time').innerHTML = await formatTime(momentObject);

    clockTimer = setTimeout(initDateTime, 10000);
  }

  await initDateTime();
}

initApp()
