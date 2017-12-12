# Dynamic content example using Screenly Pro's API

## Automated approach

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Manual approach

### Clone the repo

```
$ git clone git@github.com:Screenly/api-example-dynamic-content.git
$ cd api-example-dynamic-content
```

### Configure and deploy to Heroku

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
