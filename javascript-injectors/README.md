# Javascript Injector

JS Injector feature allows inserting your JS code to the web assets.\
The injector executes the JS code when the page loads.

Couple use-cases are
 - Login to the dashboards
 - Close modals


## Example of how to add JS Injector to an asset

What to pay attention to when you write your js injection code?

1. Your script should be idempotent as it can run multiple times.
2. Script should wait for a specific element to appear on a page because there is no guarantee that the page is fully loaded when the script runs.
3. Screenly player persists cookies set for a slide until the player reboots or playlist changes. You can optimize your script by checking if the cookie is already set.
4. In the case of redirects, the injector runs the script on each page.


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
