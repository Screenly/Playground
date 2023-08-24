# Screenly Playground

![Playground Logo](/images/playground.png)

This repository holds various examples that showcases Screenly's features and API.

## Using the Playground theme

If your Edge App depends on the Playground theme, make sure to run the following command
before uploading changes (via `screenly edge-app upload`):

```bash
EDGE_APP_PATH=<EDGE_APP_PATH> bash scripts/copy_playground_theme.sh

# For example:
# EDGE_APP_PATH=./edge-apps/clock bash scripts/copy_playground_theme.sh
```

If the `EDGE_APP_PATH` specified does not contain a `screenly.yml` file, the script
will exit immediately.

## Uploading changes to an Edge App

Before you proceed, make sure that you've installed the [Screenly CLI](https://github.com/Screenly/cli).
Go to a directory where an Edge App is located and run the following:

```bash
screenly edge-app upload
```

In order to have your screen/s include the Edge App as an asset, run:

```bash
screenly edge-app version promote --revision <REVISION>
```

Where `REVISION` refers to the revision number that you wish to be on the active playlist.

## Examples

* [Bootstrap](https://github.com/Screenly/playground/tree/master/bootstrap/): A digital signage optimized Bootstrap theme for our Playground apps.
* [Clock App](https://github.com/Screenly/clock-app): Screenly's Clock App
* [Dynamic Playlists](https://github.com/Screenly/playground/tree/master/dynamic-playlists/): An example of how to use Screenly's API to enable/disable a playlist based on weather conditions.
* [Instagram App](https://github.com/Screenly/playground/tree/master/instagram/): A basic Instagram app for Screenly.
* [JavaScript Injectors](https://github.com/Screenly/playground/tree/master/javascript-injectors/): Examples showing Screenly's JavaScript Injector.
* [Weather App](https://github.com/Screenly/weather-app): Screenly's Weather App
* [Web Asset Metadata](https://github.com/Screenly/playground/tree/master/asset-metadata/): Showcase Screenly's built-in asset metadata.
