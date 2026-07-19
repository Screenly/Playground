---
name: create-an-edge-app
description: Use when scaffolding a new Screenly Edge App — covers the template, manifest, integrations/auth, tests, and the pre-PR checklist
---

# Creating an Edge App

## When Creating an Edge App

- If you're one of the maintainers of this repository, it's encouraged to create the new Edge App in its own standalone GitHub repo under the Screenly org, rather than inside this monorepo's `edge-apps/` directory.
- It's recommended to scaffold the new Edge App first with the `@screenly/edge-apps` create-scaffold generator, following the `kebab-case` naming convention for the app name:
  ```bash
  bunx @screenly/edge-apps create <app-name>
  ```
  This produces a minimal, working app — manifest, `index.html`, `src/main.ts`, and the standard dev/build/lint/test/deploy scripts — already wired up to the library's conventions. Requires `@screenly/edge-apps` `>=1.2.0`.
- The generator only produces a basic app. Still check the closest match in the [Reference Apps](#reference-apps) section below and adapt from there for anything past that starting point — integrations/auth, Sentry error reporting, non-trivial settings, or a closer starting point for a complex UI. Note that the generator does not create `screenly_qc.yml` (an internal-only staging manifest) — copy one over from a reference app if your app needs one, and keep both manifests in sync.
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

- **Read a secret (CLI is fine).** Declare an `access_token` secret marked "for testing only", set it with `screenly edge-app setting set access_token=...` (or in `mock-data.yml`), and read it with `getSettingWithDefault('access_token', '')`. See [Screenly/google-calendar-app](https://github.com/Screenly/google-calendar-app) (`src/main.ts`).
- **Handle the OAuth flow with a tiny companion app.** A small Express + Bun server that runs the flow, stores the tokens, refreshes them, and exposes `GET /access_token/` returning `{ token, metadata }` — mimicking the Screenly OAuth service. Wire it in via `mock-data.yml`'s `screenly_oauth_tokens_url`. See the `mock-authenticator/` in [Screenly/salesforce-app](https://github.com/Screenly/salesforce-app) for a complete, minimal example.

Both paths feed the same `getCredentials()` — the Edge App code does not change between them.

## Error Reporting (Sentry)

New Edge Apps should support optional Sentry error reporting, gated behind a `sentry_dsn` setting that no-ops when unset.

- Add a `sentry_dsn` setting to `screenly.yml`/`screenly_qc.yml` as a global secret that no-ops when unset:
  ```yaml
  settings:
    sentry_dsn:
      type: secret
      title: Sentry DSN
      optional: true
      is_global: true
      help_text:
        schema_version: 1
        properties:
          advanced: true
          help_text: Sentry DSN for reporting errors. Leave empty to disable.
          type: string
  ```
- Call `setupSentry` from `@screenly/edge-apps/utils` once, near the top of `src/main.ts`, before other startup logic, passing the app name and any settings or metadata useful as context:
  ```ts
  setupSentry('app-name', { 'app-name': { screenName: screenly.metadata.screen_name } })
  ```
- Report failures with `reportError(error, { source: 'short-context' })` from `@screenly/edge-apps/utils` at meaningful failure points (credential refresh, content load, API errors) — not for expected or already-handled states.
- Dedupe repeated consecutive failures of the same kind (e.g. only report the first of a run of identical background-refresh errors) so retry loops don't spam Sentry.
- Requires `@screenly/edge-apps` `^1.1.0` or later.
- See [Screenly/salesforce-app](https://github.com/Screenly/salesforce-app) (`src/main.ts`, `src/credentials.ts`) and [Screenly/powerbi-app](https://github.com/Screenly/powerbi-app) (`src/main.ts`, `src/services.ts`) for reference implementations.

## Testing

- Write tests before the feature, then make them pass. Every app ships an `e2e/` directory (Playwright); add cases there for the behavior you build.
- For integration apps, test against mock credentials (the secret or the companion authenticator above), not a live account.

## Before Opening a PR

- Generate and commit screenshots: `bun run screenshots` (builds the app and captures all Screenly resolutions). This is required — see `edge-apps/CONTRIBUTING.md`.
- Keep `screenly_qc.yml` in sync with the app's settings and behavior.
- Confirm `bun run lint` and the tests pass.

## Reference Apps

Most Edge Apps have migrated to standalone repos under the Screenly org. For reference on more complex implementations, consult:

- [Screenly/qr-code-app](https://github.com/Screenly/qr-code-app) — simple, low-footprint example
- [Screenly/menu-board-app](https://github.com/Screenly/menu-board-app) — more complex layout
- [Screenly/cap-alerting-app](https://github.com/Screenly/cap-alerting-app) — advanced settings and data fetching
- [Screenly/google-calendar-app](https://github.com/Screenly/google-calendar-app) — integration via a test secret
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
