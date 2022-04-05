# Website Automation (aka JavaScript Injector)

**NOTE: This feature is not yet exposed to customers**

Screenly's JavaScript Injector feature allows users to perform automation on websites, such as:

* Logging into websites using credentials (or a cookie)
* Close modals, such as GDPR consent dialogues
* Scroll down a page

## Usage

To use the JavaScript Injector, you need first to create the web asset. You can do that in the [user interface](https://login.screenlyapp.com) or [using the API](https://developer.screenlyapp.com/#operation/assets_create). (While you could include the JavaScript directly in the asset creation, it can be beneficial to do the JavaScript snippet as a PATCH as it allows you to update your JavaScript code easily.)

With the asset created, you need the Asset ID. You will get that in the response from the API call, or you can dig it out from the URL in the user interface (e.g. https://cowboyneil.screenlyapp.com/manage/assets/$MY_ASSET_ID).

We are finally ready to apply the JavaScript using a PATCH on the asset.

Here's a sample Python snippet for how you can PATCH your asset:

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

### Important considerations

* Your script should be idempotent as it can run multiple times.
* Your script should execute with an interval or await when a specific element appears on the page. There is no guarantee that the page is fully loaded when the injector runs the script.
* Screenly player persists cookies set for a slide until the player reboots or playlist changes. You can check if you have already set a cookie to optimise your script.
* If your page includes redirects, the player will execute the injection script on each page.


## Examples

### Scroll down

Perhaps the most simple example would be to scroll down a page. We can accomplish this by just using the `window.scrollBy()` function. For instance, if we want to scroll down 180 pixels, we can use:

```javascript
window.scrollBy(0,180);
```

For more details see the `window.ScrollBy()` [documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollBy).


### Sign in to Screenly via cookies

<img src="../images/screenly-logo.png" alt="Screenly logo" width="200"/>

* Sign into the Screenly [user interface](https://login.screenlyapp.com).
* Retrieve the cookie `beaker.session.id` from your browser.
* Download [screenly-signin-via-cookies.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/screenly-signin-via-cookies.js) and modify it with your `beaker.session.id`.
* PATCH the asset.


### Sign in to Tableau via cookies

<img src="../images/tableau-logo.png" alt="Tableau logo" width="200"/>

* Sign into your Tableau account.
* Extract the cookie `SSESS[...]` from your browser.
* Download [tableau-via-cookies.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/tableau-via-cookies.js) and modify it with your cookies
* PATCH the asset.


## Sign in to Power BI via cookies

<img src="../images/powerbi-logo.png" alt="Power BI logo" width="200"/>

* Log in to your Power BI account.
* Extract the following cookies from your browser:
  * `.AspNet.CookiesC1`
  * `.AspNet.CookiesC2`
  * `.AspNet.Cookies`
* Download [powerbi-signin-via-cookies.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/powerbi-signin-via-cookies.js), modify it with your cookies
* PATCH the asset.

## Sign in to Power BI via credentials

<img src="../images/powerbi-logo.png" alt="Power BI logo" width="200"/>

* Download [powerbi-signin-via-credentials.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/powerbi-signin-via-credentials.js) and modify it with your credentials.
* PATCH the asset.


## Engadget cookies consent closing

<img src="../images/engadget-logo.png" alt="Engadget logo" width="200"/>

* Download [engadget-cookies-consent-closing.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/engadget-cookies-consent-closing.js)
* PATCH the asset.

## Sign in to Ship Hero via credentials

<img src="../images/shiphero-logo.png" alt="Ship Hero logo" width="200"/>

* Download [shiphero-signin-via-credentials.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/shiphero-signin-via-credentials.js) and modify it with your credentials.
* PATCH the asset.