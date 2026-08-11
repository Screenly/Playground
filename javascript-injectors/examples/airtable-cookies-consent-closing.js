(function () {
  /* Hides the cookie consent banner via CSS since it loads asynchronously.
   * Covers both OneTrust and Transcend, as Airtable has switched before. */
  if (document.getElementById('screenly-airtable-consent-hide')) return

  const style = document.createElement('style')
  style.id = 'screenly-airtable-consent-hide'
  style.textContent =
    '#onetrust-consent-sdk, #transcend-shadow-root { display: none !important; }'
  ;(document.head || document.documentElement).appendChild(style)
})()
