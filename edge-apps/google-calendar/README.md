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

See [the section on Obtaining an Access Token](#obtaining-an-access-token) for instructions on how to generate a Google API Key, if you don't have one yet.

```bash
screenly edge-app settings set api_key=<GOOGLE_ACCESS_TOKEN>
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

## Obtaining an Access Token

This section will be split into multiple parts:
- Configuring OAuth Consent
- Creating an OAuth client ID
- Initiating an OAuth flow
- Obtaining a refresh token
- Obtaining an access token

The first half requires browser interaction. The second half can be done only using the command line.

#### Prerequisites

- A Google Cloud Platform project
- A Google Calendar account

#### Part 1: Configuring OAuth Consent

Follow the steps in the [this guide on configuring OAuth consent](https://developers.google.com/workspace/guides/configure-oauth-consent).

- The publishing status will default to **Testing**.
- If you want to change the publishing status, you can do so by clicking **Audience** on the sidebar and then clicking **Publish app**. You will be prompted if you want to confirm the change. Click **Confirm**.

#### Part 2: Creating an OAuth client ID

Follow the steps in the [this guide on creating an OAuth client ID](https://developers.google.com/workspace/guides/create-credentials#oauth-client-id).

- Make sure to add at least one URL to the **Authorized redirect URIs** list by clicking on the **+ Add URI** button.
- As of the time of writing, URIs must be in HTTP or HTTPS format.

Once done, go to [the credentials page](https://console.cloud.google.com/apis/credentials) and find the client ID you just created. Click the download icon. A modal will appear. Click `Download JSON`. It will download a file with the name `client_secret_*.json`. The JSON file contains the following information that you will need in the next steps:

- `client_id`
- `client_secret`
- `auth_uri` &mdash; https://accounts.google.com/o/oauth2/auth
- `token_uri` &mdash; https://oauth2.googleapis.com/token

#### Part 3: Initializing an OAuth flow

In this section, you will be initializing an OAuth flow by entering the following URL in your browser:

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID
&response_type=code
&scope=https://www.googleapis.com/auth/calendar
&access_type=offline
&prompt=consent
&redirect_uri=YOUR_REDIRECT_URI
```

You will be prompted to select a Google account. Select the account you want to use to access your Google Calendar. Follow the instructions to allow access to your Google Calendar.

Once redirected to your `redirect_uri`, check the URL for a `code` parameter. This is the code you will need in the next step.

#### Part 4: Obtaining a refresh token

In this section, you will be obtaining a refresh token by making a request to the OAuth token endpoint.

Run the following command in your terminal:

```bash
curl -sX POST 'https://oauth2.googleapis.com/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'code=CODE' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET' \
  -d 'redirect_uri=YOUR_REDIRECT_URI' \
  -d 'grant_type=authorization_code' | jq
```

The response will include a `refresh_token` and an `access_token` that can last up to 1 hour.

```json
{
  "access_token": "ya29.a0AZY....[REDACTED]....175",
  "expires_in": 3599,
  "refresh_token": "1//06o8d....[REDACTED]....nlo",
  "scope": "https://www.googleapis.com/auth/calendar",
  "token_type": "Bearer",
}
```

> [!NOTE]
> If a Google Cloud Platform project's OAuth consent screen is configured for external users and the publishing status is set to **Testing**, the `refresh_token` will only be valid 7 days. As such, you will receive a response with a `refresh_token_expires_in` of approximately 7 days (604799 seconds).
>
> ```json
> {
>   "access_token": "ya29.a0AZY....[REDACTED]....175",
>   "expires_in": 3599,
>   "refresh_token": "1//06o8d....[REDACTED]....nlo",
>   "scope": "https://www.googleapis.com/auth/calendar",
>   "token_type": "Bearer",
>   "refresh_token_expires_in": 604799
> }
> ```

Now that you have a `REFRESH_TOKEN`, you can use it to obtain `ACCESS_TOKEN`s if needed.

> [!NOTE]
> Running the command above the second time will give the following error:
>
> ```
> {
>   "error": "invalid_grant",
>   "error_description": "Bad Request"
> }
> ```

#### Part 5: Obtaining an access token

If your `ACCESS_TOKEN` has expired, you can use the `REFRESH_TOKEN` to obtain a new one.

Run the following command in your terminal:

```bash
$ curl -sX POST 'https://oauth2.googleapis.com/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=YOUR_CLIENT_ID' \
  -d 'client_secret=YOUR_CLIENT_SECRET' \
  -d 'refresh_token=REFRESH_TOKEN' \
  -d 'grant_type=refresh_token' | jq

{
  "access_token": "ya29.a0AZY...[REDACTED]...175",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/calendar",
  "token_type": "Bearer",
  "refresh_token_expires_in": 599935
}
```

The response will include a new `ACCESS_TOKEN` that can last up to 1 hour.

> [!NOTE]
> Running the command above the second time will give a new `ACCESS_TOKEN` that will be valid for another hour the moment it is generated. However, the `refresh_token_expires_in` will be the same as the moment you ran the command for getting the refresh token.
