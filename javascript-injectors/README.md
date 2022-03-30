# Website Automation (aka JavaScript Injector)

**NOTE: This feature is not yet exposed to customers**

Screenly's JavaScript Injector feature allows users to perform automations on websites, such as:

* Logging into websites using credentials (or a cookie)
* Close modals, such as GDPR consent dialogues
* Scroll down a page

## Usage

To use the JavaScript Injector, you need to first create the web asset. You can do that in the [user interface](https://login.screenlyapp.com), or [using the API](https://developer.screenlyapp.com/#operation/assets_create). (While you could include the JavaScript directly in the asset creation, it can be beneficial to do the JavaScript snippet as a PATCH as it allows you to easily update your JavaScript code.)

With the asset created, you need the Asset ID. You will get that in the response from the API call, or you can dig it out from the URL in the user interface (e.g. https://cowboyneil.screenlyapp.com/manage/assets/$MY_ASSET_ID).

We are now finally ready to apply the JavaScript using a PATCH on the asset.

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

* Your script should be idempotent as here is a possibility it will be run several times.
* Your should execute with interval or awaiting when certain element appear on page. There is no guarantee that page is properly load when script is run.
* If you are setting cookies, they will persists while playlist is being run. As such, you can optimize your script by checking if cookie is already set.
* In case your page includes redirects, the injection script will be executed on each page.


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
* Extract the cookies `SSESS...` from your browser.
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

## Sign in to PowerBi via credentials

<img src="../images/powerbi-logo.png" alt="Power BI logo" width="200"/>

* Download [powerbi-signin-via-credentials.js](https://github.com/Screenly/playground/tree/master/javascript-injectors/powerbi-signin-via-credentials.js) and modify it with your credentials.
* PATCH the asset.
