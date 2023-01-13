/* global screenlyMetadataEndpoint, lat, lng */

// eslint-disable-next-line no-unused-vars
function loadMetadata () {
  function setValue (elClass, value = 'Not provided') {
    document.querySelector(elClass).innerText = value
  }

  function loadGoogleMaps () {
    const script = document.createElement('script')
    script.src = 'https://maps.googleapis.com/maps/api/js?key=GOOGLE_MAPS_API_KEY&callback=initMap'
    script.async = true
    document.body.appendChild(script)
  }

  if (typeof screenlyMetadataEndpoint === 'function') {
    fetch(screenlyMetadataEndpoint())
      .then((response) => response.json())
      .then((data) => {
        const { coordinates, hostname, location, screen_name: screenName, 'screenly-version': screenlyVersion, tags } = data
        /* eslint-disable no-global-assign */
        lat = coordinates[0] || lat
        lng = coordinates[1] || lng
        /* eslint-enable no-global-assign */

        loadGoogleMaps()

        setValue('.hostname', hostname)
        setValue('.version', screenlyVersion)
        setValue('.name', screenName)
        setValue('.coordinates', coordinates.join(', '))
        setValue('.location', location)
        document.querySelector('.labels').innerHTML = tags.map(tag => `<span>${tag}</span>`).join('') || 'No tags provided'
      })
  } else {
    console.warn('Virtual file not loaded')
    loadGoogleMaps()
  }
}
