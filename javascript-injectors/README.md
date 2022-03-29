# Javascript injectors examples

## Example how to add JS Injector to an asset

1. Prepare your JS Injector code

2. Run the next python code

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
