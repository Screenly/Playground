---
name: create-an-edge-app
description: Use when scaffolding a new Screenly Edge App — covers the template, manifest, integrations/auth, tests, and the pre-PR checklist
---

# Creating an Edge App

## When Creating an Edge App

- Scaffold the new Edge App using the `bun create` template from inside the `edge-apps/` directory:
  ```bash
  bun create edge-app-template --no-git <app-name>
  ```
  - The app name should follow the `kebab-case` naming convention.
- After scaffolding, add an `id` field to `screenly.yml` and `screenly_qc.yml` before running `bun run dev`.
- **Verify it boots** before building features: run `bun run dev`, `bun run lint`, and the tests. A scaffold that doesn't start is the first thing to fix.
- **Consult Figma designs** before starting implementation.
  - Ensure the [Figma MCP server](https://mcp.figma.com/mcp) is set up in Claude Code.
  - Use the Figma MCP server to access design specifications, mockups, and UI requirements.
  - Extract design tokens such as colors, spacing, typography, and component specifications from Figma.
  - Ensure the implementation matches the approved designs in Figma before proceeding with development.

## Integrations and Authentication

When the app shows data from a third-party service, **do not hand-roll an auth flow** — that is where things go wrong. Screenly delivers credentials through one runtime call, and your job is only to feed that call locally.

- Declare each integration-backed value as a **setting** in `screenly.yml` whose `help_text.properties.type` is `oauth:<provider>:<field>` (e.g. `oauth:google_calendar:access_token`). The field is either a credential or config the user picked (which calendar, which dashboard).
- Read credentials at runtime with a single call, refreshed on a loop — never reimplement the OAuth dance:
  ```ts
  const { token, metadata } = await getCredentials() // from @screenly/edge-apps
  ```
- See the [Integrations section of the Edge Apps docs](https://raw.githubusercontent.com/Screenly/cli/refs/heads/master/docs/EdgeApps.md) for the full contract.

To develop locally (real credentials aren't present), set up a **super simple** way to supply them — pick the lighter of these two:

- **Read a secret (CLI is fine).** Declare an `access_token` secret marked "for testing only", set it with `screenly edge-app setting set access_token=...` (or in `mock-data.yml`), and read it with `getSettingWithDefault('access_token', '')`. See `edge-apps/google-calendar/` (`src/main.ts`).
- **Handle the OAuth flow with a tiny companion app.** A small Express + Bun server that runs the flow, stores the tokens, refreshes them, and exposes `GET /access_token/` returning `{ token, metadata }` — mimicking the Screenly OAuth service. Wire it in via `mock-data.yml`'s `screenly_oauth_tokens_url`. See the `mock-authenticator/` in [Screenly/salesforce-app](https://github.com/Screenly/salesforce-app) for a complete, minimal example.

Both paths feed the same `getCredentials()` — the Edge App code does not change between them.

## Testing

- Write tests before the feature, then make them pass. Every app ships an `e2e/` directory (Playwright); add cases there for the behavior you build.
- For integration apps, test against mock credentials (the secret or the companion authenticator above), not a live account.

## Before Opening a PR

- Generate and commit screenshots: `bun run screenshots` (builds the app and captures all Screenly resolutions). This is required — see `edge-apps/CONTRIBUTING.md`.
- Keep `screenly_qc.yml` in sync with the app's settings and behavior.
- Confirm `bun run lint` and the tests pass.

## Reference Apps

For reference on more complex implementations, consult:

- QR Code (`edge-apps/qr-code/`) — simple, low-footprint example
- Menu Board (`edge-apps/menu-board/`) — more complex layout
- CAP Alerting (`edge-apps/cap-alerting/`) — advanced settings and data fetching
- Google Calendar (`edge-apps/google-calendar/`) — integration via a test secret
- [Screenly/salesforce-app](https://github.com/Screenly/salesforce-app) — integration with a companion OAuth authenticator

All apps depend on the `@screenly/edge-apps` NPM package and use `edge-apps-scripts` for tooling.

### About the Manifest Files

- Update the `categories` key to reflect the app's purpose.
- Add any app-specific settings under the `settings` key, sorted alphabetically.
- More information about manifest files can be found in the [Edge Apps documentation in the `Screenly/cli` repository](https://raw.githubusercontent.com/Screenly/cli/refs/heads/master/docs/EdgeApps.md).

### About `index.html`

- Organize HTML code into templates and Web Components as the app grows in complexity.
- Use HTML content templates first for simpler structures.
- Consider using Web Components for more complex UI components that require encapsulation and reusability.

### About `README.md`

- Include instructions on how to create, build, test, format, lint, and deploy the app.
- Do not add details like the directory structure, as the code frequently changes.
