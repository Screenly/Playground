# Menu Board Edge App

A dynamic and responsive menu board for digital signage displays. This Edge App allows you to create beautiful menu displays that automatically adjust their layout based on the number of items, from a few items to dozens.

## Features

- Support for up to 25 menu items
- Responsive grid layout that automatically adjusts based on item count:
  - 1-6 items: 2 columns
  - 7-12 items: 3 columns
  - 13+ items: 4 columns
- Modern glass-effect design with hover animations
- Customizable background image with proper opacity and positioning
- Configurable accent color (default: white with subtle purple tint)
- Custom menu title
- Logo support in bottom-left corner
- Automatic text scaling for readability
- Semi-transparent overlays for better contrast
- Print-friendly layout

## Configuration

### General Settings

- `menu_title`: The title displayed at the top of the menu (default: "Today's Menu")
- `background_image`: URL to a background image. For best results, use a dark or subtle image
- `accent_color`: Color for highlights and borders (default: "rgba(255, 255, 255, 0.95)")
- `logo_url`: URL to your restaurant's logo (default: "assets/screenly_food.svg")

### Menu Items

Each menu item has four components:

- `item_X_name`: Name of the menu item
- `item_X_description`: Description of the menu item
- `item_X_price`: Price of the menu item
- `item_X_labels`: Comma-separated list of labels (e.g. vegetarian, spicy, gluten-free)

Where X is a number from 1 to 25. All fields are optional - items without a name will be skipped.

### Default Menu Items

The app comes with four default pizza options:

1. Classic Margherita ($13.99)
   - San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil
   - Labels: vegetarian

2. Pepperoni Supreme ($15.99)
   - Double pepperoni, mozzarella, parmesan, homemade tomato sauce, oregano
   - Labels: spicy

3. Four Cheese ($16.99)
   - Mozzarella, gorgonzola, parmesan, fontina, fresh basil, garlic olive oil
   - Labels: vegetarian

4. Mediterranean Veggie ($14.99)
   - Roasted bell peppers, kalamata olives, red onions, cherry tomatoes, feta, spinach
   - Labels: vegetarian, gluten-free

## Example Configuration

```yaml
menu_title: "Joe's Pizza"
background_image: "assets/pizza.png"
accent_color: "rgba(255, 255, 255, 0.95)"
logo_url: "assets/screenly_food.svg"

item_1_name: "Margherita Pizza"
item_1_description: "Fresh tomatoes, mozzarella cheese, fresh basil leaves"
item_1_price: "13.99"
item_1_labels: "vegetarian"

item_2_name: "Pepperoni Pizza"
item_2_description: "Classic pepperoni, mozzarella cheese"
item_2_price: "15.99"
item_2_labels: "spicy"
```

## Design Notes

- The menu board uses a dark theme with semi-transparent overlays for optimal readability
- Menu items are displayed in glass-effect cards with subtle hover animations
- Prices are highlighted with the accent color
- Labels are displayed as small badges with appropriate colors:
  - Vegetarian: Green
  - Spicy: Red
  - Gluten-free: Blue
  - Custom labels: Purple tint
- The layout is fully responsive and works on any screen size
- The grid system ensures consistent spacing and alignment
- Background images are automatically darkened and positioned for optimal text readability

## Best Practices

1. **Background Images**
   - Use dark or subtle images to ensure text readability
   - Images should be at least 1920x1080px for best quality
   - Consider using images that don't compete with the menu content

2. **Content Length**
   - Keep item names concise (1-3 words recommended)
   - Descriptions should be brief but descriptive
   - Prices should use consistent formatting (e.g., always use .00)

3. **Organization**
   - Group similar items together (e.g., all pizzas, all drinks)
   - Use empty items to create visual separation between groups
   - Consider price alignment within categories

4. **Visual Balance**
   - Try to fill complete rows when possible
   - If using few items, consider adding images or specials
   - Use consistent description lengths for better visual harmony

## Technical Details

- Built with vanilla JavaScript (no external dependencies)
- Uses CSS Grid for responsive layouts
- Implements proper error handling for image loading
- Includes XSS prevention through HTML escaping
- Supports print media queries for physical menus
- Provides fallback support for browsers without backdrop-filter
- Uses semantic HTML and proper ARIA roles for accessibility
- Implements efficient DOM manipulation using DocumentFragment
