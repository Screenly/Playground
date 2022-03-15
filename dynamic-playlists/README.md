# Dynamic content example using Screenly's API

This example is documented in detail in [this blog post](https://www.screenly.io/blog/2017/12/15/building-intelligent-digital-signage/).

## Heroku

### Automated approach

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Screenly/api-example-dynamic-content)

### Manual approach

#### Clone the repo

```
$ git clone git@github.com:Screenly/playground.git
$ cd playground/dynamic-playlists
```

#### Configure and deploy to Heroku

```
$ heroku create
$ heroku config:set \
    PLAYLIST_ID= \
    TOKEN= \
    OPENWEATHERMAP_API_KEY= \
    LAT= \
    LNG= \
    TEMP_THRESHOLD= \
    ABOVE_OR_BELOW=
$ git push heroku master
```

## Docker

```
$ docker run -d \
    --name=screenly-api-example \
    -e PLAYLIST_ID= \
    -e TOKEN= \
    -e OPENWEATHERMAP_API_KEY= \
    -e LAT= \
    -e LNG= \
    -e TEMP_THRESHOLD= \
    -e ABOVE_OR_BELOW=
    screenly/api-example-dynamic-content
```
