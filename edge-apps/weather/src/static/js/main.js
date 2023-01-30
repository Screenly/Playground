/* global icons */

// eslint-disable-next-line no-unused-vars
function initApp (data) {
  let clockTimer
  let weatherTimer
  let refreshTimer
  let tz
  let currentWeatherId
  let tempScale = 'C'
  let timeFormat = 'h12'
  const { lat, lng } = data

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

  const countriesUsingFahrenheit = ['US', 'BS', 'KY', 'LR', 'PW', 'FM', 'MH']
  const celsiusToFahrenheit = (temp) => ((1.8 * temp) + 32)

  const getTemp = (temp) => Math.round(tempScale === 'C' ? temp : celsiusToFahrenheit(temp))
  /**
   * Utility Functions
   */

  const getDayString = (day) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[day]
  }

  const getMonthString = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
    return months[month]
  }

  const locales = JSON.parse('{"AF":"ps-AF","AL":"sq-AL","DZ":"ar-DZ","AS":"en-AS","AD":"ca","AO":"pt","AI":"en","AQ":"en-US","AG":"en","AR":"es-AR","AM":"hy-AM","AW":"nl","AU":"en-AU","AT":"de-AT","AZ":"az-Cyrl-AZ","BS":"en","BH":"ar-BH","BD":"bn-BD","BB":"en","BY":"be-BY","BE":"nl-BE","BZ":"en-BZ","BJ":"fr-BJ","BM":"en","BT":"dz","BO":"es-BO","BQ":"nl","BA":"bs-BA","BW":"en-BW","BV":"no","BR":"pt-BR","IO":"en","BN":"ms-BN","BG":"bg-BG","BF":"fr-BF","BI":"fr-BI","CV":"kea-CV","KH":"km-KH","CM":"fr-CM","CA":"en-CA","KY":"en","CF":"fr-CF","TD":"fr-TD","CL":"es-CL","CN":"zh-CN","CX":"en","CC":"en","CO":"es-CO","KM":"fr-KM","CD":"fr-CD","CG":"fr-CG","CK":"en","CR":"es-CR","HR":"hr-HR","CU":"es","CW":"nl","CY":"el-CY","CZ":"cs-CZ","CI":"fr-CI","DK":"da-DK","DJ":"fr-DJ","DM":"en","DO":"es-DO","EC":"es-EC","EG":"ar-EG","SV":"es-SV","GQ":"fr-GQ","ER":"ti-ER","EE":"et-EE","SZ":"en","ET":"am-ET","FK":"en","FO":"fo-FO","FJ":"en","FI":"fi-FI","FR":"fr-FR","GF":"fr","PF":"fr","TF":"fr","GA":"fr-GA","GM":"en","GE":"ka-GE","DE":"de-DE","GH":"ak-GH","GI":"en","GR":"el-GR","GL":"kl-GL","GD":"en","GP":"fr-GP","GU":"en-GU","GT":"es-GT","GG":"en","GN":"fr-GN","GW":"pt-GW","GY":"en","HT":"fr","HM":"en","VA":"it","HN":"es-HN","HK":"en-HK","HU":"hu-HU","IS":"is-IS","IN":"hi-IN","ID":"id-ID","IR":"fa-IR","IQ":"ar-IQ","IE":"en-IE","IM":"en","IL":"he-IL","IT":"it-IT","JM":"en-JM","JP":"ja-JP","JE":"en","JO":"ar-JO","KZ":"kk-Cyrl-KZ","KE":"ebu-KE","KI":"en","KP":"ko","KR":"ko-KR","KW":"ar-KW","KG":"ky","LA":"lo","LV":"lv-LV","LB":"ar-LB","LS":"en","LR":"en","LY":"ar-LY","LI":"de-LI","LT":"lt-LT","LU":"fr-LU","MO":"zh-Hans-MO","MG":"fr-MG","MW":"en","MY":"ms-MY","MV":"dv","ML":"fr-ML","MT":"en-MT","MH":"en-MH","MQ":"fr-MQ","MR":"ar","MU":"en-MU","YT":"fr","MX":"es-MX","FM":"en","MD":"ro-MD","MC":"fr-MC","MN":"mn","ME":"sr-Cyrl-ME","MS":"en","MA":"ar-MA","MZ":"pt-MZ","MM":"my-MM","NA":"en-NA","NR":"en","NP":"ne-NP","NL":"nl-NL","AN":"nl-AN","NC":"fr","NZ":"en-NZ","NI":"es-NI","NE":"fr-NE","NG":"ha-Latn-NG","NU":"en","NF":"en","MK":"mk-MK","MP":"en-MP","NO":"nb-NO","OM":"ar-OM","PK":"en-PK","PW":"en","PS":"ar","PA":"es-PA","PG":"en","PY":"es-PY","PE":"es-PE","PH":"en-PH","PN":"en","PL":"pl-PL","PT":"pt-PT","PR":"es-PR","QA":"ar-QA","RO":"ro-RO","RU":"ru-RU","RW":"fr-RW","RE":"fr-RE","BL":"fr-BL","SH":"en","KN":"en","LC":"en","MF":"fr-MF","PM":"fr","VC":"en","WS":"sm","SM":"it","ST":"pt","SA":"ar-SA","SN":"fr-SN","RS":"sr-Cyrl-RS","SC":"fr","SL":"en","SG":"en-SG","SX":"nl","SK":"sk-SK","SI":"sl-SI","SB":"en","SO":"so-SO","ZA":"af-ZA","GS":"en","SS":"en","ES":"es-ES","LK":"si-LK","SD":"ar-SD","SR":"nl","SJ":"no","SE":"sv-SE","CH":"fr-CH","SY":"ar-SY","TW":"zh-Hant-TW","TJ":"tg","TZ":"asa-TZ","TH":"th-TH","TL":"pt","TG":"fr-TG","TK":"en","TO":"to-TO","TT":"en-TT","TN":"ar-TN","TR":"tr-TR","TM":"tk","TC":"en","TV":"en","UG":"cgg-UG","UA":"uk-UA","AE":"ar-AE","GB":"en-GB","UM":"en-UM","US":"en-US","UY":"es-UY","UZ":"uz-Cyrl-UZ","VU":"bi","VE":"es-VE","VN":"vi-VN","VG":"en","VI":"en-VI","WF":"fr","EH":"es","YE":"ar-YE","ZM":"bem-ZM","ZW":"en-ZW","AX":"sv","XK":"sq"}')
  const setTimeFormat = (code) => {
    const locale = locales[code]
    timeFormat = Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle || 'h12'
  }

  const getTimeByOffset = (offsetinSecs, dt) => {
    const now = dt ? new Date(dt * 1000) : new Date()
    const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000)
    return new Date(utc + (offsetinSecs * 1000))
  }

  const checkIfNight = (dt) => {
    const dateTime = getTimeByOffset(tz, dt)
    const hrs = dateTime.getHours()

    return hrs <= 5 || hrs >= 20
  }

  const updateContent = (id, text) => {
    document.querySelector(`#${id}`).innerText = text
  }

  const updateAttribute = (id, attr, val) => document.querySelector(`#${id}`).setAttribute(attr, val)

  const loadBackground = (img) => {
    document.body.removeAttribute('class')
    document.body.classList.add(`bg-${img}`)
  }

  const checkIfInRange = (ranges, code) => ranges.reduce((acc, range) => acc || (code >= range[0] && code <= range[1]))

  const getWeatherImagesById = (id = 800, dt) => {
    // List of codes - https://openweathermap.org/weather-conditions
    // To do - Refactor
    const isNight = checkIfNight(dt)
    const hasNightBg = checkIfInRange([[200, 399], [500, 699], [800, 804]], id)
    let icon
    let bg

    if (id >= 200 && id <= 299) {
      icon = 'thunderstorm'
      bg = 'thunderstorm'
    }

    if (id >= 300 && id <= 399) {
      icon = 'drizzle'
      bg = 'drizzle'
    }

    if (id >= 500 && id <= 599) {
      icon = 'rain'
      bg = 'rain'
    }

    if (id >= 600 && id <= 699) {
      icon = 'snow'
      bg = 'snow'
    }

    if (id >= 700 && id <= 799) {
      // To do - Handle all 7xx cases
      icon = 'haze'

      if (id === 701 || id === 721 || id === 741) {
        bg = 'haze'
      } else if (id === 711) {
        bg = 'smoke'
      } else if (id === 731 || id === 751 || id === 761) {
        bg = 'sand'
      } else if (id === 762) {
        bg = 'volcanic-ash'
      } else if (id === 771) {
        // To do - change image squall
        bg = 'volcanic-ash'
      } else if (id === 781) {
        bg = 'tornado'
      }
    }

    if (id === 800) {
      icon = 'clear'
      bg = 'clear'
    }

    if (id === 801) {
      icon = 'partially-cloudy'
      bg = 'cloudy'
    }

    if (id >= 802 && id <= 804) {
      icon = 'mostly-cloudy'
      bg = 'cloudy'
    }

    return {
      icon: isNight ? `${icon}-night` : icon,
      bg: isNight && hasNightBg ? `${bg}-night` : bg
    }
  }

  /**
   * Update Local Time and Date
   */

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
    return is12HrFormat ? `${timeString} ${AmOrPm}` : timeString
  }

  const formatTime = (dateObj) => formatTimeByLocale(dateObj.getHours(), dateObj.getMinutes())

  const formatDate = (dateObj) => {
    const date = String(dateObj.getDate()).padStart(2, '0')
    const month = getMonthString(dateObj.getMonth())
    const day = window.innerWidth >= 480 ? getDayString(dateObj.getDay()) : getDayString(dateObj.getDay()).substring(0, 3)

    return `${day}, ${month} ${date}`
  }

  const initDateTime = (tzOffset) => {
    tz = tzOffset
    clearTimeout(clockTimer)
    const today = getTimeByOffset(tzOffset)

    updateContent('time', formatTime(today))
    updateContent('date', formatDate(today))

    clockTimer = setTimeout(() => initDateTime(tzOffset), 30000)
  }

  const updateLocation = (name) => {
    updateContent('city', name)
  }

  const updateCurrentWeather = (icon, desc, temp) => {
    updateAttribute('current-weather-icon', 'src', icons[icon])
    updateContent('current-weather-status', desc)
    updateContent('current-temp', getTemp(temp))
    updateContent('current-temp-scale', `°${tempScale}`)
  }

  const findCurrentWeatherItem = (list) => {
    const currentUTC = Math.round(new Date().getTime() / 1000)
    let itemIndex = 0

    while (itemIndex < list.length - 1 && list[itemIndex].dt < currentUTC) {
      itemIndex++
    }

    if (itemIndex > 0) {
      const timeDiffFromPrev = currentUTC - list[itemIndex - 1].dt
      const timeDiffFromCurrent = list[itemIndex].dt - currentUTC

      if (timeDiffFromPrev < timeDiffFromCurrent) {
        itemIndex = itemIndex - 1
      }
    }

    return itemIndex
  }

  const updateWeather = (list) => {
    clearTimeout(weatherTimer)
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

    const weatherListContainer = document.querySelector('#weather-item-list')
    const frag = document.createDocumentFragment()
    const windowSize = 5
    const currentWindow = list.slice(currentIndex, currentIndex <= windowSize - 1 ? currentIndex + windowSize : list.length - 1)
    currentWindow.forEach((item, index) => {
      const { dt, main: { temp }, weather } = item

      const { icon } = getWeatherImagesById(weather[0]?.id, dt)
      const dateTime = getTimeByOffset(tz, dt)

      const dummyNode = document.querySelector('.dummy-node')
      const node = dummyNode.cloneNode(true)
      node.classList.remove('dummy-node')
      node.querySelector('.item-temp').innerText = getTemp(temp)
      node.querySelector('.item-icon').setAttribute('src', icons[icon])
      node.querySelector('.item-time').innerText = index === 0 ? 'Current' : formatTime(dateTime)

      frag.appendChild(node)
    })

    weatherListContainer.innerHTML = ''
    weatherListContainer.appendChild(frag)
    // Refresh weather from local list every 15 mins
    weatherTimer = setTimeout(() => updateWeather(list), 10 * 60 * 1000)
  }

  const updateData = (data) => {
    const { city: { name, country, timezone }, list } = data
    tempScale = countriesUsingFahrenheit.includes(country) ? 'F' : 'C'
    setTimeFormat(country)
    updateLocation(name)
    initDateTime(timezone)
    updateWeather(list)
  }

  /**
   * Fetch weather
   */

  const fetchWeather = async () => {
    clearTimeout(refreshTimer)
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&cnt=10&appid=OPEN_WEATHER_API_KEY`)
      const data = await response.json()
      updateData(data)
    } catch (e) {
      console.log(e)
    }
  }

  const init = () => {
    fetchWeather()
    // Refresh weather every 2 hours
    refreshTimer = setTimeout(fetchWeather, 120 * 60 * 1000)
  }

  init()
}
