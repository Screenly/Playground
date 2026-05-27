function closeConsentbox() {
  const acceptCookieEl = Array.from(document.querySelectorAll('button')).find(
    (btn) =>
      btn.getAttribute('aria-label') === 'Accept all' ||
      btn.innerText === 'Accept all',
  )
  if (!acceptCookieEl) return
  acceptCookieEl.click()
  clearInterval(intervalId)
}

const intervalId = setInterval(closeConsentbox, 2000)
closeConsentbox()
