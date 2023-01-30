/* global screenlyMetadataEndpoint, initApp */

// eslint-disable-next-line no-unused-vars
function loadMetadata () {
  if (typeof screenlyMetadataEndpoint === 'function') {
    fetch(screenlyMetadataEndpoint())
      .then((response) => response.json())
      .then((data) => initApp(data))
  } else {
    console.warn('Virtual file not loaded')
  }
}
