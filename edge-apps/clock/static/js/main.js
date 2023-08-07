/* global moment */
// eslint-disable-next-line no-unused-vars

function initApp () {
  let clockTimer
  const latitude = screenly.metadata.coordinates[0];
  const longitude = screenly.metadata.coordinates[1];

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

    const timezone = (screenly.settings?.override_timezone != '')
      ? screenly.settings.override_timezone
      : tzlookup(latitude, longitude)
    const momentObject = moment().tz(timezone)

    document.querySelector('#date').innerText = momentObject.format('DD MMMM, YYYY')
    document.querySelector('#time').innerHTML = formatTime(momentObject)

    clockTimer = setTimeout(initDateTime, 10000)
  }

  initDateTime()
}

initApp()
