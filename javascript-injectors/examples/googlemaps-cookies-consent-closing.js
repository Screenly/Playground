function closeConsentbox () {
  const acceptCookie = document.querySelector('button[aria-label="Accept all"]')
  if (acceptCookie) {
    acceptCookie.click()
  }
}
setInterval(closeConsentbox(), 2000)
