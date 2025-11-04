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

## Calendar Source Types

This app supports three calendar source types:

1. **Google Calendar API** (`google`) - Uses Google Calendar API with OAuth authentication
2. **Outlook Calendar API** (`outlook`) - Uses Microsoft Graph API with OAuth authentication
3. **iCal URL** (`ical`) - Uses a public iCal feed URL (default)

Set the `calendar_source_type` setting to `google`, `outlook`, or `ical` depending on your preference.

## Deployment

```bash
bun run deploy
```

### Using iCal URL

See [the section on Getting the iCal URL](#getting-the-ical-url) for instructions on how to get the iCal URL.

```bash
screenly edge-app setting set calendar_source_type=ical
screenly edge-app setting set bypass_cors=true
screenly edge-app settings set ical_url=<YOUR_ICAL_URL>
```

### Using Google Calendar API

```bash
screenly edge-app setting set calendar_source_type=google
screenly edge-app setting set calendar_id=primary
```

### Using Outlook Calendar API

```bash
screenly edge-app setting set calendar_source_type=outlook
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

### Development with iCal URL

See [the section on Getting the iCal URL](#getting-the-ical-url) for instructions on how to get the iCal URL.

Update `mock-data.yml` and update the values of `calendar_source_type`, `ical_url`, and `bypass_cors`:

```yaml
settings:
  calendar_source_type: ical
  ical_url: '<YOUR_ICAL_URL>'
  bypass_cors: 'true'
```

### Development with Google Calendar API

Update `mock-data.yml` and set the calendar source type to `google`:

```yaml
settings:
  calendar_source_type: google
  calendar_id: primary
```

### Development with Outlook Calendar API

Update `mock-data.yml` and set the calendar source type to `outlook`:

```yaml
settings:
  calendar_source_type: outlook
```

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
