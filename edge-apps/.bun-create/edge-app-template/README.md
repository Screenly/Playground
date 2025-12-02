# Screenly Edge App Template

## Prerequisites

- [Bun (1.2.2+)](https://bun.sh/docs/installation)
- [Screenly Edge App CLI (v1.0.3+)](https://github.com/Screenly/cli?tab=readme-ov-file#installation)

## Getting Started

```bash
bun install
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

> [!NOTE]
> The `deploy` command takes care of building the app as well.

## Development

Install the dependencies for the first run:

```bash
bun install
```

Run the development environment with a single command:

```bash
bun run dev
```

This will build in watch mode and start the development server via [Screenly CLI](https://github.com/Screenly/cli).

## Unit Tests

To run unit tests:

```bash
bun run test:unit
```

Press `q` to quit the test runner.

## E2E Tests

Install dependencies for the first run:

```bash
bun run playwright install-deps
bun run playwright install
```

To run E2E tests:

```bash
bun run test:e2e
```

### Linting and Formatting

```bash
bun run lint
bun run format
```
