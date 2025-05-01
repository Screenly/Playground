# Menu Board Edge App

A dynamic and responsive menu board for digital signage displays. This Edge App allows you to create beautiful menu displays that automatically adjust their layout based on the number of items, from a few items to dozens.

## Features

- Support for up to 25 menu items
- Responsive grid layout that automatically adjusts based on item count:
  - 1-6 items: 2 columns
  - 7-12 items: 3 columns
  - 13+ items: 4 columns
- Customizable background image
- Configurable accent color
- Custom menu title
- Modern, clean design with hover effects
- Automatic text scaling for readability
- Semi-transparent overlays for better contrast

## Configuration

### General Settings

- `menu_title`: The title displayed at the top of the menu (default: "Today's Menu")
- `background_image`: URL to a background image. For best results, use a dark or subtle image
- `accent_color`: Hex color code for highlights and borders (default: "#7E2CD2")

### Menu Items

Each menu item has three components:
- `item_X_name`: Name of the menu item
- `item_X_description`: Description of the menu item
- `item_X_price`: Price of the menu item

Where X is a number from 1 to 25. All fields are optional - items without a name will be skipped.

## Example Configuration

```yaml
menu_title: "Joe's Pizza"
background_image: "https://example.com/pizza-bg.jpg"
accent_color: "#FF4D4D"

item_1_name: "Margherita Pizza"
item_1_description: "Fresh tomatoes, mozzarella cheese, fresh basil leaves"
item_1_price: "10.00"

item_2_name: "Pepperoni Pizza"
item_2_description: "Classic pepperoni, mozzarella cheese"
item_2_price: "12.00"
```

## Design Notes

- The menu board uses a dark theme with semi-transparent overlays for optimal readability
- Menu items are displayed in cards with subtle hover effects
- Prices are highlighted with the accent color
- The layout is fully responsive and works on any screen size
- Font sizes automatically adjust based on the number of items
- The grid system ensures consistent spacing and alignment

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