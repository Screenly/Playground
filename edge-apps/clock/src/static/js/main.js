// eslint-disable-next-line no-unused-vars
function initApp () {
  let clockTimer
  let timeFormat = 'h12'

  const locale = navigator?.languages?.length
      ? navigator.languages[0]
      : navigator.language;

  const getDefaultTimePreference = () => {
    const url = new URL(window.location)
    const preference = url.searchParams.get('24h')

    if (typeof preference === 'string') {
      return preference === '0' ? 'h12' : 'h24'
    }
  }

  const setTimeFormat = () => {
    const preference = getDefaultTimePreference()
    if (preference) {
      timeFormat = preference
    } else {
      timeFormat = Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle || 'h12'
    }
  }

  const convert24to12format = (hrs) => hrs % 12 || 12

  const padTime = (time) => String(time).padStart(2, '0')

  const formatTimeByLocale = (hrs, mins) => {
    const is12HrFormat = timeFormat === 'h11' || timeFormat === 'h12'
    const AmOrPm = hrs < 12 ? 'AM' : 'PM'
    let fmtHrs = hrs

    if (is12HrFormat) {
      fmtHrs = convert24to12format(hrs)
    }

    const timeString = `${padTime(fmtHrs)}:${padTime(mins)}`
    return is12HrFormat ? `${timeString}<span>${AmOrPm}</span>` : timeString
  }

  const formatTime = (dateObj) => formatTimeByLocale(dateObj.getHours(), dateObj.getMinutes())

  const getMonthString = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return months[month]
  }

  const formatDate = (dateObj) => {
    const date = String(dateObj.getDate()).padStart(2, '0')
    const month = getMonthString(dateObj.getMonth())
    const year = dateObj.getFullYear()

    return `${date} ${month}, ${year}`
  }

  const initDateTime = () => {
    clearTimeout(clockTimer)
    const now = new Date()

    document.querySelector('#date').innerText = formatDate(now)
    document.querySelector('#time').innerHTML = formatTime(now)

    clockTimer = setTimeout(initDateTime, 20000)
  }

  const init = () => {
    setTimeFormat()
    initDateTime()
  }

  init()
}
