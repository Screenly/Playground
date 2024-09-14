# Screenly Asset Metadata



## tl;dr

To use this Edge App, you need to retrieve a Google Maps [API key](https://developers.google.com/maps/documentation/javascript/get-api-key). It's important that you set it as 'unrestricted' for the Edge App to be able to use it.

```bash
$ cd edge-apps/asset-metadata
$ screenly edge-app create \
    --name my-asset-metadata \
    --in-place
$ screenly edge-app deploy
[...]
$ screenly edge-app instance create
$ screenly edge-app secret set google_maps_api_key=Your_API_KEY
```
