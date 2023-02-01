/* global screenlyMetadataEndpoint, initApp */

// eslint-disable-next-line no-unused-vars
function loadMetadata () {
  if (typeof screenlyMetadataEndpoint === 'function') {
    fetch(screenlyMetadataEndpoint())
      .then((response) => response.json())
      .then(() => {
        initApp()
      })
  } else {
    initApp()
    console.warn('Virtual file not loaded')
  }
}
