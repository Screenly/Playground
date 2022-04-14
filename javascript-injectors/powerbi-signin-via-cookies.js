function isCookieExist (key) {
  return document.cookie.indexOf(key + '=') !== -1
}

function setCookie (key, value) {
  if (isCookieExist(key)) {
    return false
  }
  document.cookie = key + '=' + value + '; secure; path=/;'
  return true
}

const url = 'https://app.powerbi.com/home'
const cookies = {
  '.AspNet.CookiesC1': '<COOKIE_VALUE>',
  '.AspNet.CookiesC2': '<COOKIE_VALUE>',
  '.AspNet.Cookies': 'chunks:2'
}

let isCookiesApplied = false

for (const cookieKey in cookies) {
  if (setCookie(cookieKey, cookies[cookieKey])) {
    isCookiesApplied = true
  }
}

if (isCookiesApplied) {
  window.location.replace(url)
}
