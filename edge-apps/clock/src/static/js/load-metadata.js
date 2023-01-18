/* global screenlyMetadataEndpoint, initApp */

// eslint-disable-next-line no-unused-vars
function loadMetadata () {
  if (typeof screenlyMetadataEndpoint === 'function') {
    fetch(screenlyMetadataEndpoint())
      .then((response) => response.json())
      .then((data) => {
        const { country } = data
        initApp(country)
      })
  } else {
    /* To do - Remove once tested with virtual file */
    initApp('US')
    console.warn('Virtual file not loaded')
  }
}
