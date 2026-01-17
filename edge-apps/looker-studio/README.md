# Looker Studio

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-looker-studio --repository
screenly edge-app deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

- `message` - The message to display on the screen (defaults to "Hello, Mars!")

## Development

```bash
bun install      # Install dependencies
bun run build    # Build the app
bun test         # Run tests
```

## Testing

```bash
bun test
```
