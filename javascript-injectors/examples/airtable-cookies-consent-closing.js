(function () {
  /* Hides the OneTrust cookie consent banner via CSS rather than clicking,
   * since the banner loads asynchronously and click-based approaches are unreliable. */
  if (document.getElementById('screenly-airtable-consent-hide')) return

  const style = document.createElement('style')
  style.id = 'screenly-airtable-consent-hide'
  style.textContent = '#onetrust-consent-sdk { display: none !important; }'
  ;(document.head || document.documentElement).appendChild(style)
})()
