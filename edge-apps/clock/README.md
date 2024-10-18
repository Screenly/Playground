# Screenly Clock App

![Clock Screen](./static/img/Clock-Preview.png)

## tl;dr

```bash
$ cd edge-apps/clock
$ screenly edge-app create \
    --name my-clock-app \
    --in-place
$ screenly edge-app deploy
[...] # You can tweak settings here.
# To install an app, you need to create an instance.
$ screenly edge-app instance create
```

## Tweaking the settings

### `override_timezone`

For instance, if you want to clock app to display the current date and time in London,
run the following command:

```bash
$ screenly edge-app setting set override_timezone='Europe/Paris'
# A relatively long console output...
Edge app setting successfully set.

$ screenly edge-app setting set override_locale='fr'
# A relatively long console output...
Edge app setting successfully set.
```

See [this page](https://momentjs.com/) for the list of all possible values for the time zone.
Alternatively, you can call `moment.locales()`, which returns all the supported locale values.

Setting invalid values for the timezone won't crash the app itself, it'll just fall back to the default time.
