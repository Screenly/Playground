# Screenly Clock Edge App

![Clock App Screenshot](https://github.com/Screenly/playground/blob/master/edge-apps/clock/src/static/images/clock-app.jpg?raw=true)

This is an example asset for Screenly as part of the [Screenly Playground](https://github.com/Screenly/playground).

You can view the live demo at [clock.srly.io](https://clock.srly.io/). The clock should automatically detect your local time zone and display the correct time.

## Setup

To build the container, run the below command from the root directory:

`docker build -t screenly/clock-app -f Dockerfile .`

To run the container, run:
```sh
docker run --rm \
  -v $(pwd)/src:/usr/app/src \
  -v $(pwd)/dist:/usr/app/dist \
  screenly/clock-app
```

You can optionally enable Google Analytics and Sentry. Replace `<GA_API_KEY>` with your Google Analytics API key and `<SENTRY_ID>` with your Sentry API key before running the below command.

```sh
docker run --rm \
  -e GA_API_KEY=<GA_API_KEY> \
  -e SENTRY_ID=<SENTRY_ID> \
  -v $(pwd)/src:/usr/app/src \
  -v $(pwd)/dist:/usr/app/dist \
  screenly/clock-app
```

This will create a directory called `dist` inside the root directory which will have the generated `index.html` file.

### Add the HTML file to Screenly

To add the HTML file, you'll need to setup [Screenly CLI](https://github.com/Screenly/cli).
Once that's done, run:

```sh
screenly asset add [path]
```

where `[path]` is the location of your `dist/index.html` file

This will upload the generated HTML file and make it available to be used as an edge app.
