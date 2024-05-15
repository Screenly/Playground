/* global screenly */

const apiUrl = 'https://api.tfl.gov.uk/' // Base URL for the TfL API
const stopId = screenly.settings.Stop_ID
const apiKey = screenly.settings.TFL_API

// for debug local server
// const stopId = '490005186S1';
//  Sample STOP-ID ID490005186S1 490014050A  Replace with the ID of your desired bus stop
// const apiKey = 'b4c24b35290947b089e509858e55f2f2';
// Replace with your TfL API Key

async function fetchBusData() {
	try {
		// Bus Route Detail API Request
		const stopStatus = await fetch(`${apiUrl}StopPoint/${stopId}/Arrivals?app_key=${apiKey}`)
		const stopData = await stopStatus.json()

		// Bus Line Status API Request
		const lineStatus = await fetch(`${apiUrl}Line/Mode/bus/Status?app_key=${apiKey}`)
		const lineData = await lineStatus.json()


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
		}
		else {
			busStopName.innerHTML = `${stationName} - Towards: ${stationTowards}`
		}

		if (stationPlatform === 'null') {
			busPlatform.innerHTML = `Bus Arrivals`
		}
		else {
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

		//-----------//

		// 1st Bus Details

		// Apply BUS Line status text and CSS as per the line ID.
		const routeStatus1 = document.getElementById('route-status-1')
		// If bus route status is not found, assign 22 as error.
		const bus1_route_status = (lineData[bus1LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 22

		routeStatus1.innerHTML = getStatusInfo(bus1_route_status).message
		routeStatus1.className = getStatusInfo(bus1_route_status).className

		// check if the API have bus information, if not, assign zero to hide it.
		const bus1_Line = nextBuses.length > 0 && nextBuses[0].lineName ? nextBuses[0].lineName : 0
		const bus1_Destination = nextBuses.length > 0 && nextBuses[0].destinationName ? nextBuses[0].destinationName : 0
		const bus1_time = nextBuses.length > 0 && nextBuses[0].timeToStation ? Math.floor(nextBuses[0].timeToStation / 60) : 0

		if (bus1_Line === 0 && bus1_Destination === 0 && bus1_time === 0) {
			document.querySelector('.bus-item-1').classList.add('hidden')
		}

		document.querySelector('.route-1').innerHTML = `Route ${bus1_Line}&nbsp;`
		document.querySelector('.destination-1').innerHTML = `(${bus1_Destination})`
		document.querySelector('.time-1').innerHTML = `${bus1_time} MIN`

		// 2nd Bus Details

		// Apply BUS Line status text and CSS as per the line ID.
		const routeStatus2 = document.getElementById('route-status-2')
		// If bus route status is not found, assign 22 as error.
		const bus2_route_status = (lineData[bus2LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 22

		routeStatus2.innerHTML = getStatusInfo(bus2_route_status).message
		routeStatus2.className = getStatusInfo(bus2_route_status).className

		// check if the API have bus information, if not, assign zero to hide it.
		const bus2_Line = nextBuses.length > 1 && nextBuses[1].lineName ? nextBuses[1].lineName : 0
		const bus2_Destination = nextBuses.length > 1 && nextBuses[1].destinationName ? nextBuses[1].destinationName : 0
		const bus2_time = nextBuses.length > 1 && nextBuses[1].timeToStation ? Math.floor(nextBuses[1].timeToStation / 60) : 0

		if (bus2_Line === 0 && bus2_Destination === 0 && bus2_time === 0) {
			document.querySelector('.bus-item-2').classList.add('hidden')
		}

		document.querySelector('.route-2').innerHTML = `Route ${bus2_Line}&nbsp;`
		document.querySelector('.destination-2').innerHTML = `(${bus2_Destination})`
		document.querySelector('.time-2').innerHTML = `${bus2_time} MIN`


		// 3rd bus details.

		// Apply BUS Line status text and CSS as per the line ID.
		const routeStatus3 = document.getElementById('route-status-3')
		// If bus route status is not found, assign 22 as error.
		const bus3_route_status = (lineData[bus3LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 22

		routeStatus3.innerHTML = getStatusInfo(bus3_route_status).message
		routeStatus3.className = getStatusInfo(bus3_route_status).className

		// check if the API have bus information, if not, assign zero to hide it.
		const bus3_Line = nextBuses.length > 2 && nextBuses[2].lineName ? nextBuses[2].lineName : 0
		const bus3_Destination = nextBuses.length > 2 && nextBuses[2].destinationName ? nextBuses[2].destinationName : 0;
		const bus3_time = nextBuses.length > 2 && nextBuses[2].timeToStation ? Math.floor(nextBuses[2].timeToStation / 60) : 0

		if (bus3_Line === 0 && bus3_Destination === 0 && bus3_time === 0) {
			document.querySelector('.bus-item-3').classList.add('hidden')
		}

		const bus3_routeElement = document.querySelector('.route-3').innerHTML = `Route ${bus3_Line}&nbsp;`
		const bus3_destinationElement = document.querySelector('.destination-3').innerHTML = `(${bus3_Destination})`
		const bus3_timeElement = document.querySelector('.time-3').innerHTML = `${bus3_time} MIN`

		// 4th bus details.

		// Apply BUS Line status text and CSS as per the line ID.
		const routeStatus4 = document.getElementById('route-status-4')
		// If bus route status is not found, assign 22 as error.
		const bus4_route_status = (lineData[bus4LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 22

		routeStatus4.innerHTML = getStatusInfo(bus4_route_status).message
		routeStatus4.className = getStatusInfo(bus4_route_status).className;

		const bus4_Line = nextBuses.length > 3 && nextBuses[3].lineName ? nextBuses[3].lineName : 0
		const bus4_Destination = nextBuses.length > 3 && nextBuses[3].destinationName ? nextBuses[3].destinationName : 0
		const bus4_time = nextBuses.length > 3 && nextBuses[3].timeToStation ? Math.floor(nextBuses[3].timeToStation / 60) : 0

		if (bus4_Line === 0 && bus4_Destination === 0 && bus4_time === 0) {
			document.querySelector('.bus-item-4').classList.add('hidden')
		}

		const bus4_routeElement = document.querySelector('.route-4').innerHTML = `Route ${bus4_Line}&nbsp;`
		const bus4_destinationElement = document.querySelector('.destination-4').innerHTML = `(${bus4_Destination})`
		const bus4_timeElement = document.querySelector('.time-4').innerHTML = `${bus4_time} MIN`


		// 5th bus details.

		// Apply BUS Line status text and CSS as per the line ID.
		const routeStatus5 = document.getElementById('route-status-5')
		// If bus route status is not found, assign 22 as error.
		const bus5_route_status = (lineData[bus5LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 22

		routeStatus5.innerHTML = getStatusInfo(bus5_route_status).message
		routeStatus5.className = getStatusInfo(bus5_route_status).className

		const bus5_Line = nextBuses.length > 4 && nextBuses[4].lineName ? nextBuses[4].lineName : 0;
		const bus5_Destination = nextBuses.length > 4 && nextBuses[4].destinationName ? nextBuses[4].destinationName : 0
		const bus5_time = nextBuses.length > 4 && nextBuses[4].timeToStation ? Math.floor(nextBuses[4].timeToStation / 60) : 0

		if (bus5_Line === 0 && bus5_Destination === 0 && bus5_time === 0) {
			document.querySelector('.bus-item-5').classList.add('hidden')
		}

		const bus5_routeElement = document.querySelector('.route-5').innerHTML = `Route ${bus5_Line}&nbsp;`
		const bus5_destinationElement = document.querySelector('.destination-5').innerHTML = `(${bus5_Destination})`
		const bus5_timeElement = document.querySelector('.time-5').innerHTML = `${bus5_time} MIN`


		// 6th bus details.

		//Apply BUS Line status text and CSS as per the line ID.
		const routeStatus6 = document.getElementById('route-status-6')
		// If bus route status is not found, assign 22 as error.
		const bus6_route_status = (lineData[bus6LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 22

		routeStatus6.innerHTML = getStatusInfo(bus6_route_status).message
		routeStatus6.className = getStatusInfo(bus6_route_status).className

		// check if the bus info are available in API.
		const bus6_Line = nextBuses.length > 5 && nextBuses[5].lineName ? nextBuses[5].lineName : 0
		const bus6_Destination = nextBuses.length > 5 && nextBuses[5].destinationName ? nextBuses[5].destinationName : 0
		const bus6_time = nextBuses.length > 5 && nextBuses[5].timeToStation ? Math.floor(nextBuses[5].timeToStation / 60) : 0

		if (bus6_Line === 0 && bus6_Destination === 0 && bus6_time === 0) {
			document.querySelector('.bus-item-6').classList.add('hidden')
		}

		document.querySelector('.route-6').innerHTML = `Route ${bus6_Line}&nbsp;`
		document.querySelector('.destination-6').innerHTML = `(${bus6_Destination})`
		document.querySelector('.time-6').innerHTML = `${bus6_time} MIN`

		// 7th bus details

		// Apply BUS Line status text and CSS as per the line ID.
		const routeStatus7 = document.getElementById('route-status-7')
		// If bus route status is not found, assign 22 as error.
		const bus7_route_status = (lineData[bus7LineID]?.lineStatuses?.[0]?.statusSeverity) ?? 22

		routeStatus7.innerHTML = getStatusInfo(bus7_route_status).message
		routeStatus7.className = getStatusInfo(bus7_route_status).className

		const bus7_Line = nextBuses.length > 6 && nextBuses[6].lineName ? nextBuses[6].lineName : 0
		const bus7_Destination = nextBuses.length > 6 && nextBuses[6].destinationName ? nextBuses[6].destinationName : 0
		const bus7_time = nextBuses.length > 6 && nextBuses[6].timeToStation ? Math.floor(nextBuses[6].timeToStation / 60) : 0

		if (bus7_Line === 0 && bus7_Destination === 0 && bus7_time === 0) {
			document.querySelector('.bus-item-7').classList.add('hidden')
		}

		document.querySelector('.route-7').innerHTML = `Route ${bus7_Line}&nbsp;`
		document.querySelector('.destination-7').innerHTML = `(${bus7_Destination})`
		document.querySelector('.time-7').innerHTML = `${bus7_time} MIN`

	} catch (error) {
		console.error('Error fetching bus data:', error);
		const busStopName = document.querySelector('.bus-stop-name')
		const busArrival = document.querySelector('.bus-arrival')
		busStopName.innerHTML = `Error: Check API Key and Stop ID`
		busArrival.innerHTML = error;
		document.querySelector('.bus-list').classList.add('hidden')
	}
}

/*
This function will check if the screen is oriented portrait or landscape mode
and then apply the number of bus information displayed.
*/

function getNumberOfBuses() {
	if (window.matchMedia('(orientation: portrait)').matches) {
		return 7 // portrait orientation
	} else {
		return 5 // landscape orientation
	}
}


// This function will return the route status message and css class name depends on the route status as Parameters
// Status details mentioned here: https://techforum.tfl.gov.uk/t/more-information-about-statusseverity/2538/10

function getStatusInfo(route_status) {
	if (route_status === 0) {
		return { message: 'Special Service', className: 'on-time' }
	} else if (route_status === 1) {
		return { message: 'Closed', className: 'service-closed' }
	} else if (route_status === 2) {
		return { message: 'Suspended', className: 'service-closed' }
	} else if (route_status === 3) {
		return { message: 'Part Suspended', className: 'service-closed' }
	} else if (route_status === 4) {
		return { message: 'Planned Closure', className: 'service-closed' }
	} else if (route_status === 5) {
		return { message: 'Part Closure', className: 'service-closed' }
	} else if (route_status === 6) {
		return { message: 'Severe Delays', className: 'severe-delay' }
	} else if (route_status === 7) {
		return { message: 'Reduced Service', className: 'has-delayed' }
	} else if (route_status === 8) {
		return { message: 'Bus Service', className: 'unknown-status' }
	} else if (route_status === 9) {
		return { message: 'Minor Delays', className: 'has-delayed' }
	} else if (route_status === 10) {
		return { message: 'ON TIME', className: 'on-time' }
	} else if (route_status === 11) {
		return { message: 'Part Closed', className: 'moderate-delay' }
	} else if (route_status === 12) {
		return { message: 'Exit Only', className: 'moderate-delay' }
	} else if (route_status === 13) {
		return { message: 'No Step Free Access', className: 'unknown-status' }
	} else if (route_status === 14) {
		return { message: 'Change of Frequency', className: 'unknown-status' }
	} else if (route_status === 15) {
		return { message: 'Diverted', className: 'unknown-status' }
	} else if (route_status === 16) {
		return { message: 'Not Running', className: 'has-delayed' }
	} else if (route_status === 17) {
		return { message: 'Issues Reported', className: 'has-delayed' }
	} else if (route_status === 18) {
		return { message: 'No Issues', className: 'unknown-status' }
	} else if (route_status === 19) {
		return { message: 'No Status', className: 'unknown-status' }
	} else {
		return { message: 'No Status', className: 'unknown-status' }
	}
}

fetchBusData()
// setTimeout(fetchBusData,0000);

setInterval(() => {
	fetchBusData()
	// fetchAllBusLineStatuses();
}, 30 * 1000) // refresh every 30 seconds




