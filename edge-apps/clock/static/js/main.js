/* global moment */
// eslint-disable-next-line no-unused-vars
function initApp () {
  let clockTimer

  const locale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language

  const formatTime = () => {
    moment.locale(locale)
    const time = moment().format('LT')
    const timeFragments = time.split(' ')

    return Array.isArray(timeFragments) && timeFragments.length === 2
      ? `${timeFragments[0]}<span>${timeFragments[1]}</span>`
      : time
  }

  const initDateTime = () => {
    clearTimeout(clockTimer)

    document.querySelector('#date').innerText = moment().format('DD MMMM, YYYY')
    document.querySelector('#time').innerHTML = formatTime()

    clockTimer = setTimeout(initDateTime, 10000)
  }

  initDateTime()
}

initApp()
