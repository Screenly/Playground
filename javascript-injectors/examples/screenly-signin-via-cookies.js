const beakerSessionId = '<COOKIE_VALUE>'

if (document.cookie.indexOf(beakerSessionId) === -1) {
  document.cookie = 'beaker.session.id=' + beakerSessionId + '; path=/; domain=.screenlyapp.com;'
  document.location.reload()
}
