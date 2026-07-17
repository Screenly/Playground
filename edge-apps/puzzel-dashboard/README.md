# Puzzel Dashboard

A Screenly Edge App that embeds the [Puzzel](https://www.puzzel.com/) admin dashboard in a full-screen iframe and automatically logs in using injected credentials.

## How it works

1. The player loads `index.html`, which renders a full-screen iframe pointing at the configured `dashboard_url`.
2. On each load the player injects `screenly_inject.js` into the dashboard page and supplies the configured credentials via `screenly_settings`.
3. The inject script detects the Puzzel login pages by their input field IDs and fills them automatically — no manual login required on the screen.

## Settings

| Key             | Type         | Description                                                                                        |
| --------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| `dashboard_url` | string (URL) | The URL of the Puzzel dashboard to display (default: `https://app.puzzel.com/admin/app/dashboard`) |
| `username`      | string       | Puzzel account email (Puzzel ID)                                                                   |
| `password`      | secret       | Puzzel account password (stored encrypted)                                                         |

## Login page selectors

The inject script handles Puzzel's two-step login at `https://app.puzzel.com/id/Account/Login`:

| Step         | Field             | Selector                                           |
| ------------ | ----------------- | -------------------------------------------------- |
| 1 – Username | Puzzel ID (email) | `#Input_Username`                                  |
| 1 – Submit   | Next button       | `button.submit-button[type="submit"]:not(.hidden)` |
| 2 – Password | Password          | `#Input_Password`                                  |
| 2 – Submit   | Sign-in button    | `button.submit-button[type="submit"]:not(.hidden)` |

The script detects which step is active by checking for the presence of `#Input_Username` or `#Input_Password` — no path matching required.

## Deploying

```shell
screenly edge-app create --name puzzel-dashboard --in-place
screenly edge-app deploy
```
