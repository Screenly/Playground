function closeConsentbox() {
  const acceptCookieEl = document.querySelector('button[aria-label="Accept all"]')
  if (!acceptCookieEl) return
  acceptCookieEl.click()
  clearInterval(intervalId)
}

const intervalId = setInterval(closeConsentbox, 2000)
closeConsentbox()
