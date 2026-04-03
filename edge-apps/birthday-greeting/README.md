# Birthday Greeting

A vibrant and responsive birthday greeting app for digital signage displays. This app displays personalized birthday messages with the person's name, role, and optional photo.

## Features

- Personalized birthday greeting with name and role
- Optional photo support with Base64 image encoding
- Fallback placeholder when no photo is provided

## Deployment

Create and deploy the Edge App:

```bash
bun install
screenly edge-app create --name birthday-greeting --in-place
bun run deploy
```

## Configuration

The app accepts the following settings via `screenly.yml`:

- `name` (required) - The name of the person having a birthday (e.g., "Amy Smith")
- `role` (required) - The role or position of the person (e.g., "Sales Manager")
- `image` (optional) - A Base64-encoded image of the person. If not provided or if the image fails to load, a placeholder will be displayed

### Example Configuration

```yaml
name: 'Amy Smith'
role: 'Sales Manager'
image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...'
```

## Image Format

The `image` setting accepts Base64-encoded images in the following formats:

1. **Full data URI** (recommended):

   ```text
   data:image/jpeg;base64,/9j/4AAQSkZJRg...
   ```

2. **Pure Base64 string** (will be automatically formatted):
   ```text
   /9j/4AAQSkZJRg...
   ```

## Development

```bash
bun install      # Install dependencies
bun run build    # Build the app
bun run dev      # Start development server
bun run lint     # Lint and fix code
```

## Testing

The app includes comprehensive tests for settings retrieval and image handling.

```bash
bun run test     # Run all tests
```
