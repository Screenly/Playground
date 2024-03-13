/* global clm, moment, OfflineGeocodeCity, screenly, tzlookup */
// eslint-disable-next-line no-unused-vars

const { getNearestCity } = OfflineGeocodeCity
const allTimezones = moment.tz.names()

async function initApp () {
  let clockTimer
  const { metadata, settings } = screenly
  const latitude = metadata.coordinates[0]
  const longitude = metadata.coordinates[1]

  const defaultLocale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language

  const getLocale = () => {
    const overrideLocale = settings?.override_locale

    if (overrideLocale) {
      if (moment.locales().includes(overrideLocale)) {
        return overrideLocale
      } else {
        console.warn(`Invalid locale: ${overrideLocale}. Using defaults.`)
      }
    }

    const data = getNearestCity(latitude, longitude)
    const countryCode = data.countryIso2.toUpperCase()

    return clm.getLocaleByAlpha2(countryCode) || defaultLocale
  }

  const formatTime = async (momentObject) => {
    const locale = getLocale()
    moment.locale(locale)
    const time = momentObject.format('LT')
    const timeFragments = time.split(' ')

    return Array.isArray(timeFragments) && timeFragments.length === 2
      ? `${timeFragments[0]}<span>${timeFragments[1]}</span>`
      : time
  }

  const getTimezone = () => {
    const overrideTimezone = settings?.override_timezone
    if (overrideTimezone) {
      if (allTimezones.includes(overrideTimezone)) {
        return overrideTimezone
      } else {
        console.warn(`Invalid timezone: ${overrideTimezone}. Using defaults.`)
      }
    }

    return tzlookup(latitude, longitude)
  }

  const initDateTime = async () => {
    clearTimeout(clockTimer)

    const timezone = getTimezone()
    const momentObject = moment().tz(timezone)

    document.querySelector('#date').innerText = momentObject.format('LL')
    document.querySelector('#time').innerHTML = await formatTime(momentObject)

    clockTimer = setTimeout(initDateTime, 10000)
  }

  const countdown = () => {
    const timerlimit = settings?.timer
    const countDate = moment(timerlimit).tz(getTimezone());
    const now = moment().tz(getTimezone());
    const remainingTime = countDate - now;

    const second = 1000
    const minute = second * 60
    const hour = minute * 60
    const day = hour * 24

    const textDay = Math.floor(remainingTime / day)
    const textHour = Math.floor((remainingTime % day) / hour)
    const textMinute = Math.floor((remainingTime % hour) / minute)
    const textSecond = Math.floor((remainingTime % minute) / second)

    document.querySelector(".day").innerText = textDay > 0 ? textDay : 0
    document.querySelector(".hour").innerText = textHour > 0 ? textHour : 0
    document.querySelector(".minute").innerText = textMinute > 0 ? textMinute : 0
    document.querySelector(".second").innerText = textSecond > 0 ? textSecond : 0

    setTimeout(countdown, 1000)
  };

  countdown();


  await initDateTime()
}

initApp()
