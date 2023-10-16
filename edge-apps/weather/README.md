# Screenly Weather App

To use this Edge App, you need a [OpenWeather](https://openweathermap.org) API key.

## Creating an Edge App and uploading

```bash
$ cd edge-apps/weather
$ screenly edge-app create \
    --name=EDGE_APP_NAME \
    --in-place
$ screenly edge-app upload
$ screenly edge-app secret set openweathermap_api_key=MY_API_KEY
$ screenly edge-app version promote revision=X
```
