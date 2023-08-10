/* global google, screenly */
/* eslint-disable no-new, head-script-disabled */

// eslint-disable-next-line no-unused-vars
function initMap() {
  const markerSvg = `<svg width="72" height="84" viewBox="0 0 72 84" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clip-path="url(#clip0_3318_19697)">
    <g filter="url(#filter0_d_3318_19697)">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M50.8478 63.3109C61.3492 57.9151 68.5335 46.9743 68.5335 34.3556C68.5335 16.3879 53.9678 1.82227 36.0001 1.82227C18.0325 1.82227 3.4668 16.3879 3.4668 34.3556C3.4668 46.9744 10.651 57.9151 21.1524 63.3109L36.0001 78.1586L50.8478 63.3109Z" fill="#80DD7D"/>
    </g>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M44.1334 46.5553C43.6181 46.5589 43.1453 46.27 42.9134 45.8098L41.9374 43.8442H30.0627L29.0867 45.8098C28.7406 46.4552 27.9444 46.709 27.2886 46.3829C26.6328 46.0569 26.3546 45.2688 26.6603 44.6033L27.6363 42.6378C28.0941 41.7164 29.0339 41.1336 30.0627 41.1331H41.9374C42.9662 41.1336 43.906 41.7164 44.3638 42.6378L45.3398 44.6033C45.5449 45.0217 45.5206 45.5161 45.2757 45.9125C45.0307 46.3088 44.5993 46.5516 44.1334 46.5553ZM52.2667 39.7775V26.2219C52.2667 23.976 50.446 22.1553 48.2001 22.1553H23.8001C21.5541 22.1553 19.7334 23.976 19.7334 26.2219V39.7775C19.7334 42.0235 21.5541 43.8442 23.8001 43.8442C24.5487 43.8442 25.1556 43.2373 25.1556 42.4886C25.1556 41.74 24.5487 41.1331 23.8001 41.1331C23.0514 41.1331 22.4445 40.5261 22.4445 39.7775V26.2219C22.4445 25.4733 23.0514 24.8664 23.8001 24.8664H48.2001C48.9487 24.8664 49.5556 25.4733 49.5556 26.2219V39.7775C49.5556 40.5261 48.9487 41.1331 48.2001 41.1331C47.4514 41.1331 46.8445 41.74 46.8445 42.4886C46.8445 43.2373 47.4514 43.8442 48.2001 43.8442C50.446 43.8442 52.2667 42.0235 52.2667 39.7775Z" fill="#191D2C"/>
    </g>
    <defs>
    <filter id="filter0_d_3318_19697" x="0.755686" y="0.46671" width="70.4889" height="81.7582" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
    <feOffset dy="1.35556"/>
    <feGaussianBlur stdDeviation="1.35556"/>
    <feColorMatrix type="matrix" values="0 0 0 0 0.585994 0 0 0 0 0.585994 0 0 0 0 0.585994 0 0 0 1 0"/>
    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3318_19697"/>
    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3318_19697" result="shape"/>
    </filter>
    <clipPath id="clip0_3318_19697">
    <rect width="70.4889" height="82.6889" fill="white" transform="translate(0.755615 0.466797)"/>
    </clipPath>
    </defs>
    </svg>
  `
  const lat = screenly.metadata.coordinates[0]
  const lng = screenly.metadata.coordinates[1]
  const mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(lat, parseFloat(lng) - 1.5),
    fullscreenControl: false,
    mapTypeControl: false,
    rotateControl: false,
    streetViewControl: false,
    zoomControl: false,
    // eslint-disable-next-line
    styles: [{'featureType':'all','elementType':'labels.text.fill','stylers':[{'color':'#ffffff'},{'weight':'0.20'},{'lightness':'28'},{'saturation':'23'},{'visibility':'off'}]},{'featureType':'all','elementType':'labels.text.stroke','stylers':[{'color':'#494949'},{'lightness':13},{'visibility':'off'}]},{'featureType':'all','elementType':'labels.icon','stylers':[{'visibility':'off'}]},{'featureType':'administrative','elementType':'geometry.fill','stylers':[{'color':'#000000'}]},{'featureType':'administrative','elementType':'geometry.stroke','stylers':[{'color':'#144b53'},{'lightness':14},{'weight':1.4}]},{'featureType':'landscape','elementType':'all','stylers':[{'color':'#08304b'}]},{'featureType':'poi','elementType':'geometry','stylers':[{'color':'#0c4152'},{'lightness':5}]},{'featureType':'road.highway','elementType':'geometry.fill','stylers':[{'color':'#000000'}]},{'featureType':'road.highway','elementType':'geometry.stroke','stylers':[{'color':'#0b434f'},{'lightness':25}]},{'featureType':'road.arterial','elementType':'geometry.fill','stylers':[{'color':'#000000'}]},{'featureType':'road.arterial','elementType':'geometry.stroke','stylers':[{'color':'#0b3d51'},{'lightness':16}]},{'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#000000'}]},{'featureType':'transit','elementType':'all','stylers':[{'color':'#146474'}]},{'featureType':'water','elementType':'all','stylers':[{'color':'#021019'}]}]
  }
  const mapElement = document.getElementById('map')
  const map = new google.maps.Map(mapElement, mapOptions)
  new google.maps.Marker({
    position: new google.maps.LatLng(lat, lng),
    map,
    icon: {
      url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markerSvg)}`,
      size: new google.maps.Size(72, 84),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(36, 42)
    }
  })

  new google.maps.Circle({
    strokeWeight: 0,
    fillColor: '#C4C4C4',
    fillOpacity: 0.30,
    map,
    center: new google.maps.LatLng(lat, lng),
    radius: 50000
  })

  new google.maps.Circle({
    strokeWeight: 0,
    fillColor: '#C4C4C4',
    fillOpacity: 0.20,
    map,
    center: new google.maps.LatLng(lat, lng),
    radius: 80000
  })
}

function initApp() {
  function setValue(elClass, value = 'Not provided') {
    document.querySelector(elClass).innerText = value
  }

  function loadGoogleMaps() {
    const script = document.createElement('script')
    script.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap'
    script.async = true
    document.body.appendChild(script)
  }

  const {
    coordinates,
    hostname,
    location,
    screenly_version: screenlyVersion,
    screen_name: screenName,
    tags,
  } = screenly.metadata

  loadGoogleMaps()

  setValue('.hostname', hostname)
  setValue('.version', screenlyVersion)
  setValue('.name', screenName)
  setValue('.coordinates', coordinates.join(', '))
  setValue('.location', location)

  document.querySelector('.labels').innerHTML = tags.map(tag => `<span>${tag}</span>`).join('') || 'No tags provided'
}

initApp()
