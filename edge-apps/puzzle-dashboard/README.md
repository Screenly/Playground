# Puzzle Dashboard

A Screenly Edge App that embeds an external web dashboard in a full-screen iframe and automatically fills the login form using injected credentials.

## How it works

1. The player loads `index.html`, which renders a full-screen iframe pointing at the configured `dashboard_url`.
2. On each load the player injects `screenly_inject.js` into the dashboard page and supplies the configured credentials via `screenly_settings`.
3. The inject script locates the username and password fields, fills them, and submits the form — no manual login required on the screen.

## Settings

| Key | Type | Description |
|---|---|---|
| `dashboard_url` | string (URL) | The URL of the dashboard to display |
| `username` | string | Login username |
| `password` | secret | Login password (stored encrypted) |

## Customising the inject script

`screenly_inject.js` targets common login-form selectors out of the box. If your dashboard uses non-standard field names or a React-controlled form, edit the selectors at the top of the file or switch from `setValue` to `setReactValue`.

To target a specific login path only (useful when the dashboard redirects to `/login`), wrap the call with the `onPath` helper:

```js
onPath('/login', fillLoginForm);
```

## Deploying

```shell
screenly edge-app create --name puzzle-dashboard --in-place
screenly edge-app deploy
```
