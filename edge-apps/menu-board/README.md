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

| Setting               | Description                                                                                           | Type               | Default                     |
| --------------------- | ----------------------------------------------------------------------------------------------------- | ------------------ | --------------------------- |
| `accent_color`        | Color for highlights and borders                                                                      | optional           | `rgba(255, 255, 255, 0.95)` |
| `background_image`    | URL to a background image                                                                             | optional           | -                           |
| `currency`            | Currency symbol to display with prices                                                                | optional           | `$`                         |
| `display_errors`      | Display detailed error messages on screen                                                             | optional, advanced | `false`                     |
| `logo_url`            | URL to your restaurant's logo                                                                         | optional           | -                           |
| `menu_title`          | The title displayed at the top of the menu                                                            | required           | `Today's Menu`              |
| `item_XX_description` | Description of menu item XX (where XX is `01`-`25`, zero-padded; e.g., `item_01_description`)         | optional           | -                           |
| `item_XX_labels`      | Comma-separated labels for menu item XX (e.g., vegetarian, spicy, gluten-free; where XX is `01`-`25`) | optional           | -                           |
| `item_XX_name`        | Name of menu item XX (where XX is `01`-`25`, zero-padded). Items without a name will be skipped       | optional           | -                           |
| `item_XX_price`       | Price of menu item XX (where XX is `01`-`25`, zero-padded; e.g., `item_01_price`)                     | optional           | -                           |

### Default Menu Items

The app comes with four sample pizza items pre-configured for demonstration purposes:

1. **Classic Margherita** ($13.99) - San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil • _vegetarian_
2. **Pepperoni Supreme** ($15.99) - Double pepperoni, mozzarella, parmesan, homemade tomato sauce, oregano • _spicy_
3. **Four Cheese** ($16.99) - Mozzarella, gorgonzola, parmesan, fontina, fresh basil, garlic olive oil • _vegetarian_
4. **Mediterranean Veggie** ($14.99) - Roasted bell peppers, kalamata olives, red onions, cherry tomatoes, feta, spinach • _vegetarian, gluten-free_

You can customize or replace these items with your own menu content.

## Development

```bash
bun install      # Install dependencies
bun run dev      # Start development server
```

## Testing

```bash
bun test
```
