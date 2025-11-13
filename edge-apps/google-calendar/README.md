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

## Connect Screenly to Google Account

You should connect Screenly to a Google account so that the app can access the calendar events via a Google Calendar access token.

To get started, go to the [Integrations](https://app.screenlyapp.com/manage/integrations) page and click the "+ Connect" button next to "Google Calendar".

![Connect Google Calendar](./static/images/google-calendar-integration-01.png)

You will be prompted to confirm the connection to a Google account. Click the "Connect" button.

![Connect Google Calendar](./static/images/google-calendar-integration-02.png)

You will be redirected to a Google OAuth consent screen. Select the Google account you want to connect to Screenly. Follow through the prompts to grant Screenly access to your Google Calendar data.

Once connected, you will be redirected back to the integrations page. You should see that the Google Calendar integration is now connected.


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

This will start the development server via the [Screenly CLI](https://github.com/Screenly/cli) and open the app in the browser.

Update `mock-data.yml` with the following values:

- `screenly_app_auth_token`: A Google OAuth access token with sufficient scopes to read calendar events
  - Check [this documentation about using OAuth 2.0 web server applications](https://developers.google.com/identity/protocols/oauth2/web-server#httprest_2) for more information on how to get an access token.
- `screenly_oauth_tokens_url`: `https://api.screenlyappstage.com/api/v3/edge-apps/oauth/tokens/`

## Linting and Formatting

```bash
bun run lint
bun run format
```
