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
bun run build
bun run deploy
```

## Development

Run the following on a terminal to start the development server:

```bash
bun install
bun run dev
```

Run the following on a second terminal to generate mock data:

```bash
screenly edge-app run --generate-mock-data --path dist/
```
