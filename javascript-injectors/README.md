# Javascript injectors examples

---

<img src="../images/screenly-logo.png" alt="Screenly logo" width="200"/>

## Sign in to Screenly webconsole via cookies

#### Log in to the console

#### Required cookies 
- `beaker.session.id`

#### JS
```js
const beakerSessionId = "<COOKIE_VALUE>";

if (document.cookie.indexOf(beakerSessionId) === -1) {
    document.cookie = 'beaker.session.id=' + beakerSessionId + '; path=/; domain=.screenlyapp.com;';
    document.location.reload();
}
```

---

<img src="../images/tableau-logo.png" alt="Tableau logo" width="200"/>

## Sign in to Tableau via cookies

#### Log in to the console

#### Required cookies
- `SSESS...`

#### JS
```js
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
```

---

<img src="../images/powerbi-logo.png" alt="PowerBi logo" width="200"/>

## Sign in to PowerBi via cookies

#### Log in to the console

#### Required cookies
- `.AspNet.CookiesC1`
- `.AspNet.CookiesC2`
- `.AspNet.Cookies`

#### JS
```js
function isCookieExist(key) {
    return document.cookie.indexOf(key + "=") !== -1
}

function setCookie(key, value) {
    if (isCookieExist(key)) {
        return false
    }
    document.cookie = key + '=' + value + '; secure; path=/;';
    return true
}

const url = "https://app.powerbi.com/home"
const cookies = {
    ".AspNet.CookiesC1": "<COOKIE_VALUE>", 
    ".AspNet.CookiesC2": "<COOKIE VALUE>",
    ".AspNet.Cookies": "chunks:2",
}

let isCookiesApplied = false;

for (const cookieKey in cookies) {
    if (setCookie(cookieKey, cookies[cookieKey])) {
        isCookiesApplied = true
    }
}

if (isCookiesApplied) {
    window.location.replace(url)
}
```

---

<img src="../images/powerbi-logo.png" alt="PowerBi logo" width="200"/>

## Sign in to PowerBi via credentials

#### JS
```js
(function () {
    if (typeof url !== 'undefined') {
        return
    }

    var url = "https://app.powerbi.com/home";
    const username = "<YOUR_USERNAME>";
    const password = "<YOUR_PASSWORD>";

    let isSingleSignOnPassed = false;
    let isOauthPassed = false;

    function callback() {
        try {
            if (window.location.pathname === '/singleSignOn' && !isSingleSignOnPassed) {
                document.querySelector("#email").value = username;
                submitEmail();
                isSingleSignOnPassed = true;
            }

            if (window.location.pathname === '/common/oauth2/authorize' && !isOauthPassed) {
                const passwordInput = document.querySelector('input[name="passwd"]');
                passwordInput.value = password;
                passwordInput.dispatchEvent(new Event('change'));
                document.querySelector('input[type="submit"]').click();
                isOauthPassed = true;
            }

            if (window.location.pathname === '/common/login') {
                window.location.replace(url)
            }
        } catch (error) {
            console.error(error)
        }
    }

    callback();
    setInterval(callback, 1000);
})();
```
