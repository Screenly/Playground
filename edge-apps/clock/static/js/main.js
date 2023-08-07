/* global moment */
// eslint-disable-next-line no-unused-vars

function initApp () {
  let clockTimer
  const latitude = screenly.metadata.coordinates[0];
  const longitude = screenly.metadata.coordinates[1];
  const googleMapsTimezoneApiUrl = 'https://maps.googleapis.com/maps/api/timezone/json'
  const apiKey = screenly.settings.gm_api_key;

  const getTimezoneFromCoordinates = async (latitude, longitude) => {
    const queryParams = [
      `location=${latitude},${longitude}`,
      `timestamp=${Date.now() / 1000}`,
      `key=${apiKey}`
    ].join('&')
    const response = await fetch(`${googleMapsTimezoneApiUrl}?${queryParams}`)
    const data = await response.json()
    return data.timeZoneId
  }

  const locale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language

  const formatTime = (momentObject) => {
    moment.locale(locale)
    const time = momentObject.format('LT')
    const timeFragments = time.split(' ')

    return Array.isArray(timeFragments) && timeFragments.length === 2
      ? `${timeFragments[0]}<span>${timeFragments[1]}</span>`
      : time
  }

  const initDateTime = () => {
    clearTimeout(clockTimer)

    getTimezoneFromCoordinates(latitude, longitude).then(timezoneFromCoordinates => {
      const momentObject = (screenly.settings?.timezone != '')
        ? moment().tz(screenly.settings.timezone)
        : moment().tz(timezoneFromCoordinates)

      document.querySelector('#date').innerText = momentObject.format('DD MMMM, YYYY')
      document.querySelector('#time').innerHTML = formatTime(momentObject)
    })

    clockTimer = setTimeout(initDateTime, 10000)
  }

  initDateTime()
}

initApp()
