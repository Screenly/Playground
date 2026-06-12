# Puzzle Dashboard

A Screenly Edge App that embeds the [Puzzle](https://www.puzzle.io/) dashboard in a full-screen iframe and automatically logs in using injected credentials.

## How it works

1. The player loads `index.html`, which renders a full-screen iframe pointing at the configured `dashboard_url`.
2. On each load the player injects `screenly_inject.js` into the dashboard page and supplies the configured credentials via `screenly_settings`.
3. The inject script detects the Auth0 Universal Login page (`/u/login`), fills the username and password fields, and clicks the submit button — no manual login required on the screen.

## Settings

| Key             | Type         | Description                                |
| --------------- | ------------ | ------------------------------------------ |
| `dashboard_url` | string (URL) | The URL of the Puzzle dashboard to display |
| `username`      | string       | Puzzle account email                       |
| `password`      | secret       | Puzzle account password (stored encrypted) |

## Login page selectors

The inject script targets the Puzzle Auth0 login page at `https://auth.puzzle.io/u/login`:

| Field    | Selector                                    |
| -------- | ------------------------------------------- |
| Email    | `#username`                                 |
| Password | `#password`                                 |
| Submit   | `button[data-action-button-primary="true"]` |

The `button[data-action-button-primary="true"]` selector is intentional — it targets only the email/password submit button and avoids the Google SSO and Rippling SSO buttons also present on the page.

## Deploying

```shell
screenly edge-app create --name puzzle-dashboard --in-place
screenly edge-app deploy
```
