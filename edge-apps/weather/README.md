# Screenly Weather App

![Weather App Preview](static/images/weather-app-preview.png)

To use this Edge App, you need a [OpenWeather](https://openweathermap.org) API key.

## Prerequisites

* Install Screenly CLI - Please follow the guide [here](https://github.com/Screenly/cli)

## Steps

Step 1. **Log in to the Screenly account via CLI**

Follow the on-screen instructions to log in to your Screenly account.

`$ screenly login`

Step 2. **Download and Open Edge App Playground**

`$ git clone https://github.com/Screenly/Playground.git`

Step 3. **Enter weather Edge App Directory**

`$ cd edge-apps/weather`

Step 4. **Create a New weather Edge App:**

`$ screenly edge-app create --name "Weather Edge App" --in-place`

Replace "Weather_EdgeApp" with your desired app name.

Step 5. **Upload the Edge App**

`$ screenly edge-app deploy`

Wait for the upload to complete.

Step 6 **Create an Instance**

`$ screenly edge-app instance create`

Step 7. **Specify the OpenWeather API Key** for example: 1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ

Obtain the API key from [OpenWeather API](https://openweathermap.org)

`$ screenly edge-app secret set openweathermap_api_key=API`

Step 8. **Check the Screenly Dashboard**

Open the Screenly dashboard and verify that the new Edge App has been added as an asset.

Step 9. **Assign Asset to Playlist and Device**

* Assign the new asset to a playlist.
* Assign the playlist to a device.

Now, the Weather Edge App has been configured, and the designated webpage/dashboard will be presented on the Screenly-connected TV/Monitor.

## Override the Location

To override the location, you can change the coordinates in the screenly dashboard or via CLI. In default, the app will use the device's coordinates.

`$ screenly edge-app setting set override_coordinates=123.456,78.910`

## Override the Locale

To override the locale, you can change the locale in the screenly dashboard or via CLI. In default, the app will use the device's locale or 'en' if the device's locale is not supported.

`$ screenly edge-app setting set override_locale=en`

You can find the list of supported locales [here](https://momentjs.com/)



