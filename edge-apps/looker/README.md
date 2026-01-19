# Looker Edge App

A dashboard for displaying Looker dashboards and reports using the Looker Embed SDK with cookieless embedding.

> **Note:** This app is for **Looker** (enterprise BI platform), not Looker Studio. Looker Studio is a separate product that does not support token-based embedding.

## Prerequisites

- A Looker instance (hosted or self-hosted) with:
  - **Embed SSO Authentication** enabled
  - **Embed JWT Secret** configured (for cookieless embedding)
- API credentials for token generation

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting        | Required | Description                                                      |
| -------------- | -------- | ---------------------------------------------------------------- |
| `looker_host`  | Yes      | Your Looker instance hostname (e.g., `mycompany.looker.com`)     |
| `dashboard_id` | Yes      | The ID of the Looker dashboard to display                        |
| `embed_token`  | No       | For testing only. In production, tokens are fetched dynamically. |

## Development

```bash
bun install      # Install dependencies
bun run build    # Build the app
bun run dev      # Run locally
```

## Deployment

```bash
screenly edge-app create --name my-looker-app --in-place
bun run deploy
screenly edge-app instance create
```

## How It Works

This Edge App uses the [Looker Embed SDK](https://github.com/looker-open-source/embed-sdk) with cookieless embedding:

1. The app requests session tokens from the Screenly OAuth backend
2. Tokens are passed to the Looker Embed SDK
3. The SDK creates an authenticated iframe
4. Tokens are automatically refreshed before expiration

## References

- [Looker Embed SDK Documentation](https://cloud.google.com/looker/docs/embed-sdk-intro)
- [Cookieless Embedding](https://cloud.google.com/looker/docs/cookieless-embed)
- [Looker vs Looker Studio](https://cloud.google.com/looker/docs/looker-core-overview)
