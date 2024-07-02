/* global screenly */
const BusMonitor = (() => {

  const apiUrl = 'http://api.511.org/transit/StopMonitoring'; // Base URL for the TfL API
  const stopId = screenly.settings.stop_id;
  const apiKey = screenly.settings.transit_api_key
  const proxyUrl = screenly.cors_proxy_url;
  const mockStopData = '../1/static/data/stops.json';

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


  /*
  This function will check if the screen is oriented portrait or landscape mode
  and then apply the number of bus information displayed.
  */
  function getNumberOfBuses() {
    return window.matchMedia('(orientation: portrait)').matches ? 7 : 5;
  }

  function getStatusInfo(routeStatus) {
    return statusMessages[routeStatus] || { message: 'No Status', className: 'unknown-status' };
  }

  async function fetchBusData() {
    try {
      // mock
      const stopPoints = await getCachedData(mockStopData, 'stopData');
      // const stopPoints = await getCachedData(`${proxyUrl}/${apiUrl}?api_key=${apiKey}&agency=AC`, 'stopData');
      const stopData = stopPoints.ServiceDelivery.StopMonitoringDelivery.MonitoredStopVisit;
      const sortedBuses = stopData.sort((a, b) => 
        a.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime - b.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime);
      const nextBuses = sortedBuses.slice(0, getNumberOfBuses());

      const stationName = sortedBuses[0]?.MonitoredVehicleJourney.OriginName || 0;
      const stationTowards = sortedBuses[0]?.MonitoredVehicleJourney.DestinationName || 0;
      const stationPlatform = sortedBuses[0]?.MonitoredVehicleJourney.MonitoredCall.StopPointName || 0;

      const busStopName = document.querySelector('.bus-stop-name');
      const busPlatform = document.querySelector('.bus-arrival');

      busStopName.innerHTML = stationTowards === 'null' ? `${stationName}` : `${stationName} - Towards: ${stationTowards}`;
      busPlatform.innerHTML = stationPlatform === 'null' ? 'Bus Arrivals' : `Bus Arrivals: Platform - ${stationPlatform}`;

      updateBusInfo(nextBuses);

    } catch (error) {
      handleError(error);
    }
  }

  function updateBusInfo(nextBuses) {
    for (let i = 0; i < getNumberOfBuses(); i++) {
      const busLineID = nextBuses[i]?.MonitoredVehicleJourney.LineRef || 0;
      const inCongestion = nextBuses[i]?.MonitoredVehicleJourney.InCongestion;
      const routeStatus = document.getElementById(`route-status-${i + 1}`);

      const busLine = nextBuses.length > i && nextBuses[i]?.MonitoredVehicleJourney.PublishedLineName || 0;
      const busDestination = nextBuses.length > i && nextBuses[i]?.MonitoredVehicleJourney.DestinationName || 0;
      const busTime = nextBuses.length > i && Math.floor(nextBuses[i]?.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime / 60) || 0;

      if (busLine === 0 && busDestination === 0 && busTime === 0) {
        document.querySelector(`.bus-item-${i + 1}`).classList.add('hidden');
      } else {
        document.querySelector(`.route-${i + 1}`).innerHTML = `Route ${busLine}&nbsp;`;
        document.querySelector(`.destination-${i + 1}`).innerHTML = `(${busDestination})`;
        document.querySelector(`.time-${i + 1}`).innerHTML = `${busTime} MIN`;
      }
    }
  }

  function handleError(error) {
    console.error('Error fetching bus data:', error);
    const busStopName = document.querySelector('.bus-stop-name');
    const busArrival = document.querySelector('.bus-arrival');
    busStopName.innerHTML = 'Error: Check API Key and Stop ID';
    busArrival.innerHTML = error;
    document.querySelector('.bus-list').classList.add('hidden');
  }

  return {
    fetchBusData
  };
})();

BusMonitor.fetchBusData();