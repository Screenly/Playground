# Screenly Clock Edge App

![Clock App Screenshot](https://github.com/Screenly/playground/blob/master/edge-apps/clock/src/static/images/clock-app.jpg?raw=true)

This is an example asset for Screenly as part of the [Screenly Playground](https://github.com/Screenly/playground).

You can view the live demo at [clock.srly.io](https://clock.srly.io/). The clock should automatically detect your local time zone and display the correct time.

## Setup

To build the container, run the below command from the root directory:

`docker build -t screenly/mock-clock-metadata -f Dockerfile .`

To start the container, run:

```bash
docker run --rm \
  -p "3004:3004" \
  screenly/mock-clock-metadata
```

### Upload the Clock edge app

This section is a **_work in progress_**. Stay tuned for updates.
