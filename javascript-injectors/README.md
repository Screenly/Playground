# Javascript Injector

JS Injector feature allows to insert your JS code to the web assets.\
The JS code will be executed when the page loads.

Couple use-cases are
 - Login to the dashboards
 - Close modals


## Example how to add JS Injector to an asset

What to pay attention to when you write your js injection code.

1. Script should be idempotent. As there is a possibility it will be run several times.
2. Script should execute with interval or awaiting when certain element appear on page, cause there is no guarantee that page is properly load when script is run.
3. When cookies are set, it persists while playlist is being run. So you can optimize your script by checking if cookie is already set.
4. In case of redirects, injection script will be executed on each page.

To enrich your web asset with injection code you can use [Screenly API](https://developer.screenlyapp.com/#operation/assets_partial_update) \
Or adapt following python code

```python
import requests

headers = {
    "Authorization": "Token <TOKEN>",
    "Content-Type": "application/json"
}
asset_id = "<ASSET_ID>"
js_code = """
<YOUR_JS_CODE>
"""

response = requests.patch(
    url=f'https://api.screenlyapp.com/api/v3/assets/{asset_id}/',
    json={'js_injection': js_code},
    headers=headers
)
```

## Several JS injection examples


<img src="../images/screenly-logo.png" alt="Screenly logo" width="200"/>

## Sign in to Screenly webconsole via cookies

#### Log in to the console

#### Required cookies 
- `beaker.session.id`

#### [JavaScript Injector](https://github.com/Screenly/playground/tree/master/javascript-injectors/screenly-signin-via-cookies.js)

---

<img src="../images/tableau-logo.png" alt="Tableau logo" width="200"/>

## Sign in to Tableau via cookies

#### Log in to the console

#### Required cookies
- `SSESS...`

#### [JavaScript Injector](https://github.com/Screenly/playground/tree/master/javascript-injectors/tableau-via-cookies.js)

---

<img src="../images/powerbi-logo.png" alt="PowerBi logo" width="200"/>

## Sign in to PowerBi via cookies

#### Log in to the console

#### Required cookies
- `.AspNet.CookiesC1`
- `.AspNet.CookiesC2`
- `.AspNet.Cookies`

#### [JavaScript Injector](https://github.com/Screenly/playground/tree/master/javascript-injectors/powerbi-signin-via-cookies.js)

---

<img src="../images/powerbi-logo.png" alt="PowerBi logo" width="200"/>

## Sign in to PowerBi via credentials

#### [JavaScript Injector](https://github.com/Screenly/playground/tree/master/javascript-injectors/powerbi-signin-via-credentials.js)


## Engadget cookies consent closing 

<img src="../images/engadget-logo.png" alt="Engadget logo" width="200"/>

* Download [engadget-cookies-consent-closing.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/engadget-cookies-consent-closing.js)
* PATCH the asset.
