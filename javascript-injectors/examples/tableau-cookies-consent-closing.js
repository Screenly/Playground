function closeConsentbox () {
  const acceptCookie = document.querySelector('button[id="onetrust-accept-btn-handler"]')
  if (acceptCookie) {
    acceptCookie.click()
  }
}
setInterval(closeConsentbox(), 2000)
