# Simple Table App

A minimalist edge app for Screenly that displays CSV data as a beautifully formatted table with sophisticated single-color theming.

## Features

- **CSV Data Display**: Renders CSV content with automatic header detection
- **Single-Color Theming**: Generates entire color scheme from one base color using HSV manipulation
- **Light/Dark Theme Support**: Automatically adjusts colors for optimal readability
- **Responsive Design**: Clean, minimal table layout that works on all screen sizes
- **Visual Hierarchy**: Subtle saturation and lightness variations create clear content hierarchy

## Settings

### Required Settings

- **CSV Content** (`content`): Your CSV data with comma-separated values. First row is treated as headers.

### Optional Settings

- **Table Title** (`title`): Optional title displayed above the table
- **Theme Color** (`theme_color`): Base color for the entire theme. If empty, uses Screenly's default colors
- **Theme** (`theme`): Choose 'light' or 'dark' theme (default: light)

## Color System

The app uses a sophisticated HSV-based color system that generates all colors from a single base color:

### Backgrounds (Light → Dark hierarchy)

- **Title Background**: Most saturated (up to 20%), darkest
- **Header Background**: Medium saturated (up to 15%), medium darkness
- **Default Background**: Least saturated (up to 10%), lightest

### Text Colors

All text uses consistent lightness with varying saturation levels:

- **Title Text**: Maximum 20% saturation
- **Header Text**: Maximum 15% saturation
- **Body Text**: Maximum 10% saturation

## Technical Details

- **Framework**: Vue.js 3 with Composition API and TypeScript
- **Build System**: Vite with SCSS support
- **CSV Parsing**: Custom parser with quote handling
- **Styling**: Modern CSS with flexbox and custom properties

## Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Build only (without type checking)
bun run build-only
```

## Project Structure

```plaintext
src/
├── App.vue                      # Main app component
├── main.ts                      # Application entry point
├── components/
│   ├── TableDisplay.vue         # Table component with header
│   └── TimeDisplay.vue          # Time display component
├── stores/
│   └── settings.ts              # Settings store (timezone/locale)
└── assets/
    ├── main.scss                # Global styles
    ├── table-display.scss       # Responsive table styles
    ├── time-display.scss        # Time display styles
    └── font/                    # Aeonik font files

screenly.yml                     # Edge App configuration
```

## CSV Format

The app accepts standard CSV format:

```csv
Name, Surname, Age
John, Smith, 25
Jane, Brown, 30
```

- First row is automatically treated as headers
- Comma-separated values
- Quote handling for values containing commas
- Last column is automatically right-aligned (ideal for numeric data)
