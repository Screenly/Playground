# Screenly Menu Board App

## Getting Started

```bash
bun install
```

## Deployment

Create and deploy the Edge App:

```bash
screenly edge-app create --name my-menu-board --in-place
bun run deploy
screenly edge-app instance create
```

## Configuration

The app accepts the following settings via `screenly.yml`:

| Setting            | Description                                | Type     | Default                     |
| ------------------ | ------------------------------------------ | -------- | --------------------------- |
| `accent_color`     | Color for highlights and borders           | optional | `rgba(255, 255, 255, 0.95)` |
| `background_image` | URL to a background image                  | optional | -                           |
| `logo_url`         | URL to your restaurant's logo              | optional | `assets/screenly_food.svg`  |
| `menu_title`       | The title displayed at the top of the menu | optional | `Today's Menu`              |

### Menu Items

Each menu item has four components (all optional):

- `item_X_name` - Name of the menu item
- `item_X_description` - Description of the menu item
- `item_X_price` - Price of the menu item
- `item_X_labels` - Comma-separated list of labels (e.g., vegetarian, spicy, gluten-free)

Where X is a number from 1 to 25. Items without a name will be skipped.

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```
