# Screenly Calendar App

## Prerequisites

- Bun (v1.2.2+)
- Screenly Edge App CLI (v1.0.3+)

## Getting Started

We need to initialize the necessary dependencies and build the source
code first so that a `dist` directory can be created. This is essential as a manifest file
(which defaults to `screenly.yml`) and an `index.html` file is needed.

```bash
bun install
bun run build
screenly edge-app create \
    --name=EDGE_APP_NAME \
    --in-place
```

## Create an Edge App Instance via CLI

```bash
screenly edge-app instance create --name=EDGE_APP_INSTANCE_NAME
```

## Deployment

```bash
bun run deploy
```

See [the section on Getting the iCal URL](#getting-the-ical-url) for instructions on how to get the iCal URL.

```bash
screenly edge-app setting set bypass_cors=true
screenly edge-app settings set ical_url=<YOUR_ICAL_URL>
```

## Development

Install the dependencies for the first run:

```bash
bun install
```

Run the following command to start the development server:

```bash
bun run dev
```

This will start the development server via the [Screenly CLI](https://github.com/Screenly/cli) and opens the app in the browser.

See [the section on Getting the iCal URL](#getting-the-ical-url) for instructions on how to get the iCal URL.

Update `mock-data.yml` and update the values of `ical_url` and `bypass_cors` with the URL of the iCal feed you want to use and `true` respectively.

## Linting and Formatting

```bash
bun run lint
bun run format
```

## Getting the iCal URL

- Go to your [Google Calendar](https://google.com/calendar).
- On the left sidebar, under "My calendars", select the calendar you want
  to use.
- Click on the three dots on the right side of the calendar and select
  "Settings and sharing".
- Scroll down until you see "Secret address in iCal format".
  Click on the copy button to the right.
- A "Security warning" will appear, saying that
  "[you] should not give the secret address to other people".
  Click "OK" to continue.
- The secret address will be copied to your clipboard, which you can use
  into the Edge App settings.
