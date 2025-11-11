# Google Calendar App

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

Update `mock-data.yml` and update the values of `screenly_app_auth_token` and `screenly_oauth_tokens_url` in `screenly.yml` to test with mock data.

## Linting and Formatting

```bash
bun run lint
bun run format
```
