/* global screenly */

const apiUrl = 'https://api.tfl.gov.uk/' // Base URL for the TfL API
const stopId = screenly.settings.stop_id
const apiKey = screenly.settings.tfl_api_token
const sentryDsn = screenly.settings.sentry_dsn

async function getCachedData (url, cacheKey) {
  const cachedData = JSON.parse(localStorage.getItem(cacheKey))
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    localStorage.setItem(cacheKey, JSON.stringify(data))
    return data
  } catch (error) {
    if (cachedData) {
      console.warn('Fetching new data failed, using cached data:', error)
      return cachedData
    } else {
      throw error
    }
  }
}

async function fetchBusData () {
  try {
    // Bus Route Detail API Request
    const stopData = await getCachedData(`${apiUrl}StopPoint/${stopId}/Arrivals?app_key=${apiKey}`, 'stopData')
    // Bus Line Status API Request
    const lineData = await getCachedData(`${apiUrl}Line/Mode/bus/Status?app_key=${apiKey}`, 'lineData')
    // Fetch latest bus status details as per the time.
    const sortedBuses = stopData.sort((a, b) => a.timeToStation - b.timeToStation)
    const nextBuses = sortedBuses.slice(0, getNumberOfBuses())

    // Fetch BUS Station Name and Station Towards details, If not fetched -> Assigned to Zero.
    const stationName = sortedBuses[0] && sortedBuses[0].stationName ? sortedBuses[0].stationName : 0
    const stationTowards = sortedBuses[0] && sortedBuses[0].towards ? sortedBuses[0].towards : 0
    const stationPlatform = sortedBuses[0] && sortedBuses[0].platformName ? sortedBuses[0].platformName : 0

    // Bus Stop Query Selector
    const busStopName = document.querySelector('.bus-stop-name')
    const busPlatform = document.querySelector('.bus-arrival')

    // Some station does not have towards station, In that situation - We are hiding the Towards text.
    if (stationTowards === 'null') {
      busStopName.innerHTML = `${stationName}`
    } else {
      busStopName.innerHTML = `${stationName} - Towards: ${stationTowards}`
    } if (stationPlatform === 'null') {
      busPlatform.innerHTML = 'Bus Arrivals'
    } else {
      busPlatform.innerHTML = `Bus Arrivals: Platform - ${stationPlatform}`
    }

    // Fetch Bus Line ID and If bus is not available, assigned to Zero.
    const bus1LineID = nextBuses[0] && nextBuses[0].lineId ? nextBuses[0].lineId : 0
    const bus2LineID = nextBuses[1] && nextBuses[1].lineId ? nextBuses[1].lineId : 0
    const bus3LineID = nextBuses[2] && nextBuses[2].lineId ? nextBuses[2].lineId : 0
    const bus4LineID = nextBuses[3] && nextBuses[3].lineId ? nextBuses[3].lineId : 0
    const bus5LineID = nextBuses[4] && nextBuses[4].lineId ? nextBuses[4].lineId : 0
    const bus6LineID = nextBuses[5] && nextBuses[5].lineId ? nextBuses[5].lineId : 0
    const bus7LineID = nextBuses[6] && nextBuses[6].lineId ? nextBuses[6].lineId : 0

    // 1st Bus Details
    // Apply BUS Line status text and CSS as per the line ID.
    const routeStatus1 = document.getElementById('route-status-1')
    // If bus route status is not found, assign 22 as error.
    const bus1RouteStatus = (lineData[bus1LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 19

    routeStatus1.innerHTML = getStatusInfo(bus1RouteStatus).message
    routeStatus1.className = getStatusInfo(bus1RouteStatus).className

    // check if the API have bus information, if not, assign zero to hide it.
    const bus1Line = nextBuses.length > 0 && nextBuses[0].lineName ? nextBuses[0].lineName : 0
    const bus1Destination = nextBuses.length > 0 && nextBuses[0].destinationName ? nextBuses[0].destinationName : 0
    const bus1Time = nextBuses.length > 0 && nextBuses[0].timeToStation ? Math.floor(nextBuses[0].timeToStation / 60) : 0

    if (bus1Line === 0 && bus1Destination === 0 && bus1Time === 0) {
      document.querySelector('.bus-item-1').classList.add('hidden')
    }

    document.querySelector('.route-1').innerHTML = `Route ${bus1Line}&nbsp;`
    document.querySelector('.destination-1').innerHTML = `(${bus1Destination})`
    document.querySelector('.time-1').innerHTML = `${bus1Time} MIN`

    // 2nd Bus Details

    // Apply BUS Line status text and CSS as per the line ID.
    const routeStatus2 = document.getElementById('route-status-2')
    // If bus route status is not found, assign 22 as error.
    const bus2RouteStatus = (lineData[bus2LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 19

    routeStatus2.innerHTML = getStatusInfo(bus2RouteStatus).message
    routeStatus2.className = getStatusInfo(bus2RouteStatus).className

    // check if the API have bus information, if not, assign zero to hide it.
    const bus2Line = nextBuses.length > 1 && nextBuses[1].lineName ? nextBuses[1].lineName : 0
    const bus2Destination = nextBuses.length > 1 && nextBuses[1].destinationName ? nextBuses[1].destinationName : 0
    const bus2Time = nextBuses.length > 1 && nextBuses[1].timeToStation ? Math.floor(nextBuses[1].timeToStation / 60) : 0

    if (bus2Line === 0 && bus2Destination === 0 && bus2Time === 0) {
      document.querySelector('.bus-item-2').classList.add('hidden')
    }

    document.querySelector('.route-2').innerHTML = `Route ${bus2Line}&nbsp;`
    document.querySelector('.destination-2').innerHTML = `(${bus2Destination})`
    document.querySelector('.time-2').innerHTML = `${bus2Time} MIN`

    // 3rd bus details.

    // Apply BUS Line status text and CSS as per the line ID.
    const routeStatus3 = document.getElementById('route-status-3')
    // If bus route status is not found, assign 22 as error.
    const bus3RouteStatus = (lineData[bus3LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 19

    routeStatus3.innerHTML = getStatusInfo(bus3RouteStatus).message
    routeStatus3.className = getStatusInfo(bus3RouteStatus).className

    // check if the API have bus information, if not, assign zero to hide it.
    const bus3Line = nextBuses.length > 2 && nextBuses[2].lineName ? nextBuses[2].lineName : 0
    const bus3Destination = nextBuses.length > 2 && nextBuses[2].destinationName ? nextBuses[2].destinationName : 0
    const bus3Time = nextBuses.length > 2 && nextBuses[2].timeToStation ? Math.floor(nextBuses[2].timeToStation / 60) : 0

    if (bus3Line === 0 && bus3Destination === 0 && bus3Time === 0) {
      document.querySelector('.bus-item-3').classList.add('hidden')
    }

    document.querySelector('.route-3').innerHTML = `Route ${bus3Line}&nbsp;`
    document.querySelector('.destination-3').innerHTML = `(${bus3Destination})`
    document.querySelector('.time-3').innerHTML = `${bus3Time} MIN`

    // 4th bus details.

    // Apply BUS Line status text and CSS as per the line ID.
    const routeStatus4 = document.getElementById('route-status-4')
    // If bus route status is not found, assign 22 as error.
    const bus4RouteStatus = (lineData[bus4LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 19

    routeStatus4.innerHTML = getStatusInfo(bus4RouteStatus).message
    routeStatus4.className = getStatusInfo(bus4RouteStatus).className

    const bus4Line = nextBuses.length > 3 && nextBuses[3].lineName ? nextBuses[3].lineName : 0
    const bus4Destination = nextBuses.length > 3 && nextBuses[3].destinationName ? nextBuses[3].destinationName : 0
    const bus4Time = nextBuses.length > 3 && nextBuses[3].timeToStation ? Math.floor(nextBuses[3].timeToStation / 60) : 0

    if (bus4Line === 0 && bus4Destination === 0 && bus4Time === 0) {
      document.querySelector('.bus-item-4').classList.add('hidden')
    }

    document.querySelector('.route-4').innerHTML = `Route ${bus4Line}&nbsp;`
    document.querySelector('.destination-4').innerHTML = `(${bus4Destination})`
    document.querySelector('.time-4').innerHTML = `${bus4Time} MIN`

    // 5th bus details.

    // Apply BUS Line status text and CSS as per the line ID.
    const routeStatus5 = document.getElementById('route-status-5')
    // If bus route status is not found, assign 22 as error.
    const bus5RouteStatus = (lineData[bus5LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 19

    routeStatus5.innerHTML = getStatusInfo(bus5RouteStatus).message
    routeStatus5.className = getStatusInfo(bus5RouteStatus).className

    const bus5Line = nextBuses.length > 4 && nextBuses[4].lineName ? nextBuses[4].lineName : 0
    const bus5Destination = nextBuses.length > 4 && nextBuses[4].destinationName ? nextBuses[4].destinationName : 0
    const bus5Time = nextBuses.length > 4 && nextBuses[4].timeToStation ? Math.floor(nextBuses[4].timeToStation / 60) : 0

    if (bus5Line === 0 && bus5Destination === 0 && bus5Time === 0) {
      document.querySelector('.bus-item-5').classList.add('hidden')
    }

    document.querySelector('.route-5').innerHTML = `Route ${bus5Line}&nbsp;`
    document.querySelector('.destination-5').innerHTML = `(${bus5Destination})`
    document.querySelector('.time-5').innerHTML = `${bus5Time} MIN`

    // 6th bus details.

    // Apply BUS Line status text and CSS as per the line ID.
    const routeStatus6 = document.getElementById('route-status-6')
    // If bus route status is not found, assign 22 as error.
    const bus6RouteStatus = (lineData[bus6LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 19

    routeStatus6.innerHTML = getStatusInfo(bus6RouteStatus).message
    routeStatus6.className = getStatusInfo(bus6RouteStatus).className

    // check if the bus info are available in API.
    const bus6Line = nextBuses.length > 5 && nextBuses[5].lineName ? nextBuses[5].lineName : 0
    const bus6Destination = nextBuses.length > 5 && nextBuses[5].destinationName ? nextBuses[5].destinationName : 0
    const bus6Time = nextBuses.length > 5 && nextBuses[5].timeToStation ? Math.floor(nextBuses[5].timeToStation / 60) : 0

    if (bus6Line === 0 && bus6Destination === 0 && bus6Time === 0) {
      document.querySelector('.bus-item-6').classList.add('hidden')
    }

    document.querySelector('.route-6').innerHTML = `Route ${bus6Line}&nbsp;`
    document.querySelector('.destination-6').innerHTML = `(${bus6Destination})`
    document.querySelector('.time-6').innerHTML = `${bus6Time} MIN`

    // 7th bus details

    // Apply BUS Line status text and CSS as per the line ID.
    const routeStatus7 = document.getElementById('route-status-7')
    // If bus route status is not found, assign 22 as error.
    const bus7RouteStatus = (lineData[bus7LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 19

    routeStatus7.innerHTML = getStatusInfo(bus7RouteStatus).message
    routeStatus7.className = getStatusInfo(bus7RouteStatus).className

    const bus7Line = nextBuses.length > 6 && nextBuses[6].lineName ? nextBuses[6].lineName : 0
    const bus7Destination = nextBuses.length > 6 && nextBuses[6].destinationName ? nextBuses[6].destinationName : 0
    const bus7Time = nextBuses.length > 6 && nextBuses[6].timeToStation ? Math.floor(nextBuses[6].timeToStation / 60) : 0

    if (bus7Line === 0 && bus7Destination === 0 && bus7Time === 0) {
      document.querySelector('.bus-item-7').classList.add('hidden')
    }

    document.querySelector('.route-7').innerHTML = `Route ${bus7Line}&nbsp;`
    document.querySelector('.destination-7').innerHTML = `(${bus7Destination})`
    document.querySelector('.time-7').innerHTML = `${bus7Time} MIN`
  } catch (error) {
    console.error('Error fetching bus data:', error)
    const busStopName = document.querySelector('.bus-stop-name')
    const busArrival = document.querySelector('.bus-arrival')
    busStopName.innerHTML = 'Error: Check API Key and Stop ID'
    busArrival.innerHTML = error
    document.querySelector('.bus-list').classList.add('hidden')
  }

  // Send signal to load the screen once content is ready, if the function exists.
  if (typeof screenly !== 'undefined' && typeof screenly.signalReadyForRendering === 'function') {
    screenly.signalReadyForRendering()
  }
}

/*
This function will check if the screen is oriented portrait or landscape mode
and then apply the number of bus information displayed.
*/

function getNumberOfBuses () {
  if (window.matchMedia('(orientation: portrait)').matches) {
    return 7 // portrait orientation
  } else {
    return 5 // landscape orientation
  }
}

// This function will return the route status message and css class name depends on the route status as Parameters
// Status details mentioned here: https://techforum.tfl.gov.uk/t/more-information-about-statusseverity/2538/10

function getStatusInfo (routeStatus) {
  if (routeStatus === 0) {
    return { message: 'Special Service', className: 'on-time' }
  } else if (routeStatus === 1) {
    return { message: 'Closed', className: 'service-closed' }
  } else if (routeStatus === 2) {
    return { message: 'Suspended', className: 'service-closed' }
  } else if (routeStatus === 3) {
    return { message: 'Part Suspended', className: 'service-closed' }
  } else if (routeStatus === 4) {
    return { message: 'Planned Closure', className: 'service-closed' }
  } else if (routeStatus === 5) {
    return { message: 'Part Closure', className: 'service-closed' }
  } else if (routeStatus === 6) {
    return { message: 'Severe Delays', className: 'severe-delay' }
  } else if (routeStatus === 7) {
    return { message: 'Reduced Service', className: 'has-delayed' }
  } else if (routeStatus === 8) {
    return { message: 'Bus Service', className: 'unknown-status' }
  } else if (routeStatus === 9) {
    return { message: 'Minor Delays', className: 'has-delayed' }
  } else if (routeStatus === 10) {
    return { message: 'ON TIME', className: 'on-time' }
  } else if (routeStatus === 11) {
    return { message: 'Part Closed', className: 'moderate-delay' }
  } else if (routeStatus === 12) {
    return { message: 'Exit Only', className: 'moderate-delay' }
  } else if (routeStatus === 13) {
    return { message: 'No Step Free Access', className: 'unknown-status' }
  } else if (routeStatus === 14) {
    return { message: 'Change of Frequency', className: 'unknown-status' }
  } else if (routeStatus === 15) {
    return { message: 'Diverted', className: 'unknown-status' }
  } else if (routeStatus === 16) {
    return { message: 'Not Running', className: 'has-delayed' }
  } else if (routeStatus === 17) {
    return { message: 'Issues Reported', className: 'has-delayed' }
  } else if (routeStatus === 18) {
    return { message: 'No Issues', className: 'unknown-status' }
  } else if (routeStatus === 19) {
    return { message: 'No Status', className: 'unknown-status' }
  } else {
    return { message: 'No Status', className: 'unknown-status' }
  }
}

fetchBusData()
setInterval(() => {
  fetchBusData()
}, 120 * 1000) // refresh every 120 seconds/ 2 Minutes.
