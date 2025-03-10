# Screenly Google Calendar App

## Prerequisites

- Node.js (v22.0.0+)
- npm (v10.9.0+)
- Screenly Edge App CLI (v1.0.3+)

## Getting Started

```bash
$ cd edge-apps/google-calendar
$ screenly edge-app create \
    --name=EDGE_APP_NAME \
    --in-place
$ screenly edge-app instance create
```

## Deployment

Run the following on a terminal to build the Edge App:

```bash
npm install
npm run build
screenly edge-app deploy --path dist/
```

For this Edge App, you will need to configure the iCal URL to be used.
Please follow the instructions below to get the iCal URL.

### Getting the iCal URL

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

### Setting the iCal URL

```bash
screenly edge-app settings set ical_url=<YOUR_ICAL_URL>
```

## Development

Run the following on a terminal to start the development server:

```bash
npm install
npm run dev
```

Run the following on a second terminal to start the Edge App server:

```bash
screenly edge-app run --generate-mock-data --path dist/
screenly edge-app run --path dist/
```

## Linting

We use [standard](https://standardjs.com/) to lint the codebase.

```bash
npx standard --fix # Automatically fixes linting errors.
```

Some rules are not automatically fixable, so you will need to fix them manually.
