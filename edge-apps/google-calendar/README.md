# Screenly Google Calendar App

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
$ npm install
$ npm run build
$ screenly edge-app deploy --path dist/
```

## Development

Run the following on a terminal to start the development server:

```bash
$ npm install
$ npm run dev
```

Run the following on a second terminal to start the Edge App server:

```bash
$ screenly edge-app run --generate-mock-data --path dist/
$ screenly edge-app run --path dist/
```
