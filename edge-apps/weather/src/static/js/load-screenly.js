/* global loadMetadata */

(function () {
  function loadScreenly () {
    const script = document.createElement('script')
    script.src = './screenly.js'
    script.async = true
    script.onload = loadMetadata
    script.onerror = function () {
      console.warn('screenly js is not available. Loading defaults')
      loadMetadata()
    }
    document.head.appendChild(script)
  }

  loadScreenly()
})()
  