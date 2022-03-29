function isCookieExist(key) {
    return document.cookie.indexOf(key + "=") !== -1
}

function setCookie(key, value) {
    if (isCookieExist(key)) {
        return false
    }
    document.cookie = key + '=' + value + '; path=/; domain=.www.tableau.com;';
    return true
}

const key = "<COOKIE_KEY>";
const value = "<COOKIE_VALUE>";

const isCookiesApplied = setCookie(key, value)

if (isCookiesApplied) {
    document.location.reload()
}
