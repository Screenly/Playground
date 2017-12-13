# Dynamic content example using Screenly Pro's API

## Heroku

### Automated approach

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/Screenly/api-example-dynamic-content)

### Manual approach

#### Clone the repo

```
$ git clone git@github.com:Screenly/api-example-dynamic-content.git
$ cd api-example-dynamic-content
```

#### Configure and deploy to Heroku

```
$ heroku create
$ heroku config:set \
    PLAYLIST_ID= \
    TOKEN= \
    DARKSKY_API_KEY= \
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
    -e DARKSKY_API_KEY= \
    -e LAT= \
    -e LNG= \
    -e TEMP_THRESHOLD= \
    -e ABOVE_OR_BELOW=
    screenly/api-example-dynamic-content
```
