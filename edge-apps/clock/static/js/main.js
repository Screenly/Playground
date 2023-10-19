/* global moment */
// eslint-disable-next-line no-unused-vars

function initApp () {
  let clockTimer
  const { metadata, settings } = screenly
  const latitude = metadata.coordinates[0]
  const longitude = metadata.coordinates[1]

  const locale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language

  const formatTime = (momentObject) => {
    moment.locale(locale);
    const time = momentObject.format('HH:mm'); // Use 'HH:mm' for 24-hour format
    return time;
}


  const initDateTime = () => {
    clearTimeout(clockTimer)

    const timezone = settings?.override_timezone || tzlookup(latitude, longitude)
    const momentObject = moment().tz(timezone)

    document.querySelector('#date').innerText = momentObject.format('MMMM DD, YYYY')
    document.querySelector('#time').innerHTML = formatTime(momentObject)

    clockTimer = setTimeout(initDateTime, 10000)
  }

  initDateTime()
}

initApp()
