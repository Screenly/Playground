// eslint-disable-next-line no-unused-vars
function initApp (country) {
  let clockTimer
  let timeFormat = 'h12'
  const locales = JSON.parse('{"AF":"ps-AF","AL":"sq-AL","DZ":"ar-DZ","AS":"en-AS","AD":"ca","AO":"pt","AI":"en","AQ":"en-US","AG":"en","AR":"es-AR","AM":"hy-AM","AW":"nl","AU":"en-AU","AT":"de-AT","AZ":"az-Cyrl-AZ","BS":"en","BH":"ar-BH","BD":"bn-BD","BB":"en","BY":"be-BY","BE":"nl-BE","BZ":"en-BZ","BJ":"fr-BJ","BM":"en","BT":"dz","BO":"es-BO","BQ":"nl","BA":"bs-BA","BW":"en-BW","BV":"no","BR":"pt-BR","IO":"en","BN":"ms-BN","BG":"bg-BG","BF":"fr-BF","BI":"fr-BI","CV":"kea-CV","KH":"km-KH","CM":"fr-CM","CA":"en-CA","KY":"en","CF":"fr-CF","TD":"fr-TD","CL":"es-CL","CN":"zh-CN","CX":"en","CC":"en","CO":"es-CO","KM":"fr-KM","CD":"fr-CD","CG":"fr-CG","CK":"en","CR":"es-CR","HR":"hr-HR","CU":"es","CW":"nl","CY":"el-CY","CZ":"cs-CZ","CI":"fr-CI","DK":"da-DK","DJ":"fr-DJ","DM":"en","DO":"es-DO","EC":"es-EC","EG":"ar-EG","SV":"es-SV","GQ":"fr-GQ","ER":"ti-ER","EE":"et-EE","SZ":"en","ET":"am-ET","FK":"en","FO":"fo-FO","FJ":"en","FI":"fi-FI","FR":"fr-FR","GF":"fr","PF":"fr","TF":"fr","GA":"fr-GA","GM":"en","GE":"ka-GE","DE":"de-DE","GH":"ak-GH","GI":"en","GR":"el-GR","GL":"kl-GL","GD":"en","GP":"fr-GP","GU":"en-GU","GT":"es-GT","GG":"en","GN":"fr-GN","GW":"pt-GW","GY":"en","HT":"fr","HM":"en","VA":"it","HN":"es-HN","HK":"en-HK","HU":"hu-HU","IS":"is-IS","IN":"hi-IN","ID":"id-ID","IR":"fa-IR","IQ":"ar-IQ","IE":"en-IE","IM":"en","IL":"he-IL","IT":"it-IT","JM":"en-JM","JP":"ja-JP","JE":"en","JO":"ar-JO","KZ":"kk-Cyrl-KZ","KE":"ebu-KE","KI":"en","KP":"ko","KR":"ko-KR","KW":"ar-KW","KG":"ky","LA":"lo","LV":"lv-LV","LB":"ar-LB","LS":"en","LR":"en","LY":"ar-LY","LI":"de-LI","LT":"lt-LT","LU":"fr-LU","MO":"zh-Hans-MO","MG":"fr-MG","MW":"en","MY":"ms-MY","MV":"dv","ML":"fr-ML","MT":"en-MT","MH":"en-MH","MQ":"fr-MQ","MR":"ar","MU":"en-MU","YT":"fr","MX":"es-MX","FM":"en","MD":"ro-MD","MC":"fr-MC","MN":"mn","ME":"sr-Cyrl-ME","MS":"en","MA":"ar-MA","MZ":"pt-MZ","MM":"my-MM","NA":"en-NA","NR":"en","NP":"ne-NP","NL":"nl-NL","AN":"nl-AN","NC":"fr","NZ":"en-NZ","NI":"es-NI","NE":"fr-NE","NG":"ha-Latn-NG","NU":"en","NF":"en","MK":"mk-MK","MP":"en-MP","NO":"nb-NO","OM":"ar-OM","PK":"en-PK","PW":"en","PS":"ar","PA":"es-PA","PG":"en","PY":"es-PY","PE":"es-PE","PH":"en-PH","PN":"en","PL":"pl-PL","PT":"pt-PT","PR":"es-PR","QA":"ar-QA","RO":"ro-RO","RU":"ru-RU","RW":"fr-RW","RE":"fr-RE","BL":"fr-BL","SH":"en","KN":"en","LC":"en","MF":"fr-MF","PM":"fr","VC":"en","WS":"sm","SM":"it","ST":"pt","SA":"ar-SA","SN":"fr-SN","RS":"sr-Cyrl-RS","SC":"fr","SL":"en","SG":"en-SG","SX":"nl","SK":"sk-SK","SI":"sl-SI","SB":"en","SO":"so-SO","ZA":"af-ZA","GS":"en","SS":"en","ES":"es-ES","LK":"si-LK","SD":"ar-SD","SR":"nl","SJ":"no","SE":"sv-SE","CH":"fr-CH","SY":"ar-SY","TW":"zh-Hant-TW","TJ":"tg","TZ":"asa-TZ","TH":"th-TH","TL":"pt","TG":"fr-TG","TK":"en","TO":"to-TO","TT":"en-TT","TN":"ar-TN","TR":"tr-TR","TM":"tk","TC":"en","TV":"en","UG":"cgg-UG","UA":"uk-UA","AE":"ar-AE","GB":"en-GB","UM":"en-UM","US":"en-US","UY":"es-UY","UZ":"uz-Cyrl-UZ","VU":"bi","VE":"es-VE","VN":"vi-VN","VG":"en","VI":"en-VI","WF":"fr","EH":"es","YE":"ar-YE","ZM":"bem-ZM","ZW":"en-ZW","AX":"sv","XK":"sq"}')

  const getDefaultTimePreference = () => {
    const url = new URL(window.location)
    const preference = url.searchParams.get('24h')

    if (typeof preference === 'string') {
      return preference === '0' ? 'h12' : 'h24'
    }
  }

  const setTimeFormat = (code) => {
    const preference = getDefaultTimePreference()
    if (preference) {
      timeFormat = preference
    } else {
      const locale = locales[code]
      timeFormat = Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle || 'h12'
    }
  }

  const generateAnalyticsEvent = (name, payload) => {
    typeof gtag !== 'undefined' && gtag('event', name, payload) // eslint-disable-line no-undef
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

  const setBanner = () => {
    const banner = document.querySelector('.upgrade-banner')
    const { userAgent } = navigator
    const isScreenlyDevice = userAgent.includes('screenly-viewer')

    if (!isScreenlyDevice) {
      banner.classList.add('visible')
    }

    generateAnalyticsEvent('device', {
      app_name: 'Screenly Clock App',
      screenly_device: isScreenlyDevice
    })
  }

  const init = () => {
    // loadBackground('clear')
    setTimeFormat(country)
    initDateTime()
    setBanner()
  }

  init()
}
