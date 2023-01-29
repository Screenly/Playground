# Screenly Weather Edge App

This is an example asset for Screenly as part of the [Screenly Playground](https://github.com/Screenly/playground).

You can view the live demo at [weather.srly.io](https://weather.srly.io/).

## Setup

To build the container, run the below command from the root directory:

`docker build -t screenly/weather-app -f Dockerfile .`

To run the container, run:
```sh
docker run --rm \
  -e GA_API_KEY=<GA_API_KEY> \
  -e SENTRY_ID=<SENTRY_ID> \
  -e OPEN_WEATHER_API_KEY=<OPEN_WEATHER_API_KEY> \
  -v $(pwd)/src:/usr/app/src \
  -v $(pwd)/dist:/usr/app/dist
  screenly/weather-app
```

Replace `<GA_API_KEY>` with your Google Analytics API key, `<SENTRY_ID>` with your Sentry API key and `<OPEN_WEATHER_API_KEY>` with your Open Weather API key before running the above command.

This will create a directory called `dist` inside the root directory which will have the generated `index.html` file.

### Add the HTML file to Screenly

To add the HTML file, you'll need to setup [Screenly CLI](https://github.com/Screenly/cli).
Once that's done, run:

```sh
screenly asset add [path]
```

where `[path]` is the location of your `dist/index.html` file

This will upload the generated HTML file and make it available to be used as an edge app.
