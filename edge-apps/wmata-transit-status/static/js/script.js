/* stylelint-disable */

/* global screenly */

const apiKey = screenly.settings.api_key
const stopParams = {
  api_key: apiKey,
  StopID: screenly.settings.stop_id
}

const stopQueryString = new URLSearchParams(stopParams).toString()
const lineQueryString = new URLSearchParams({ api_key: apiKey }).toString()
const stopUrl = `https://api.wmata.com/NextBusService.svc/json/jPredictions?${stopQueryString}`
const lineStatusUrl = `https://api.wmata.com/Incidents.svc/json/BusIncidents?${lineQueryString}`

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
    const stopData = await getCachedData(stopUrl, 'stopData')
    const buses = stopData.Predictions
    const lineData = await getCachedData(lineStatusUrl, 'lineStatusData')
    const nextBuses = buses.slice(0, 6)
    const stationName = (buses[0] && stopData.StopName) || 0
    const stationTowards = (buses[0] && buses[0].DirectionText) || 0
    const busStopName = document.querySelector('.bus-stop-name')

    busStopName.innerHTML = stationTowards === 'null' ? `${stationName}` : `${stationName} - Towards: ${stationTowards}`

    for (const busIndex in buses) {
      const busItemNum = parseInt(busIndex) + 1
      const routeStatusId = document.getElementById(`route-status-${busItemNum}`)

      const getIncidentOnRoute = () => {
        for (const incident of lineData.BusIncidents) {
          if (incident.RoutesAffected.includes(buses[busIndex].RouteID)) {
            return incident.IncidentType
          }
        }
        return null
      }

      const busRouteStatus = getIncidentOnRoute() || 'No Delays'
      routeStatusId.innerHTML = busRouteStatus

      const busLine = nextBuses.length > busIndex && nextBuses[busIndex].RouteID ? nextBuses[busIndex].RouteID : 0
      const busDestination = nextBuses.length > busIndex && nextBuses[busIndex].DirectionText ? nextBuses[busIndex].DirectionText : 0
      const busTime = nextBuses.length > busIndex && nextBuses[busIndex].Minutes ? nextBuses[busIndex].Minutes : 0

      if (busLine === 0 && busDestination === 0 && busTime === 0) {
        document.querySelector(`.bus-item-${busItemNum}`).classList.add('hidden')
      } else {
        document.querySelector(`.route-${busItemNum}`).innerHTML = `Route ${busLine}&nbsp;`
        document.querySelector(`.destination-${busItemNum}`).innerHTML = `(${busDestination})`
        document.querySelector(`.time-${busItemNum}`).innerHTML = `${busTime} MIN`
      }
    }
  } catch (error) {
    handleError(error)
  }
  screenly.signalReadyForRendering()
}

const handleError = (error) => {
  console.error('Error fetching bus data:', error)
  const busStopName = document.querySelector('.bus-stop-name')
  const busArrival = document.querySelector('.bus-arrival')
  busStopName.innerHTML = 'Error: Check API Key and Stop ID'
  busArrival.innerHTML = error
  document.querySelector('.bus-list').classList.add('hidden')
}

fetchBusData()
setInterval(() => {
  fetchBusData()
}, 120 * 1000)
