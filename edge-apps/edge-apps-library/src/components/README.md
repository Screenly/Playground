# Edge Apps Web Components

Reusable web components for building consistent Edge Apps.

## Component Structure

Each component is organized in its own directory with a single TypeScript file containing all logic, templates, and styles:

```text
components/
  brand-logo/
    brand-logo.ts      # Complete component (TypeScript + HTML template + CSS)
  app-header/
    app-header.ts      # Complete component (TypeScript + HTML template + CSS)
  auto-scaler/
    auto-scaler.ts     # Complete component (TypeScript + CSS)
  dev-tools/
    dev-tools.ts       # Complete component (TypeScript + CSS)
```

Each component file contains:

- **TypeScript class** extending `HTMLElement`
- **HTML template** as a template literal
- **CSS styles** as a template literal within `<style>` tags
- **Shadow DOM** created in the constructor for encapsulation

This single-file approach simplifies maintenance and follows web component best practices.

## Available Components

### `<brand-logo>`

Displays the branding logo from Screenly settings with fallback to screen name.

**Usage:**

```html
<brand-logo></brand-logo>
```

**Attributes:**

- `show-name` (optional): Show screen name alongside logo (default: false)
- `fallback-to-name` (optional): Show screen name if logo unavailable (default: true)
- `max-width` (optional): Maximum width for logo (default: "120px")
- `max-height` (optional): Maximum height for logo (default: "32px")

**Examples:**

```html
<!-- Basic usage -->
<brand-logo></brand-logo>

<!-- Show name alongside logo -->
<brand-logo show-name></brand-logo>

<!-- Custom size -->
<brand-logo max-width="200px" max-height="48px"></brand-logo>

<!-- No fallback to name -->
<brand-logo fallback-to-name="false"></brand-logo>
```

### `<app-header>`

A flexible header component with branding and time display.

**Usage:**

```html
<app-header></app-header>
```

**Attributes:**

- `show-logo` (optional): Show brand logo (default: true)
- `show-time` (optional): Show time display (default: true)
- `show-date` (optional): Show date display (default: false)
- `time-format` (optional): Time format - "12h" or "24h" (default: auto-detect)

**Examples:**

```html
<!-- Basic usage -->
<app-header></app-header>

<!-- With date -->
<app-header show-date></app-header>

<!-- 24-hour format -->
<app-header time-format="24h"></app-header>

<!-- Logo only -->
<app-header show-time="false" show-date="false"></app-header>
```

## Suggested Components to Build

Based on common patterns across Edge Apps, here are suggested components:

### 1. **`<edge-header>`** - Flexible Header Component

- Brand logo/name on left
- Time/date display on right
- Optional subtitle or additional content
- Configurable styling

### 2. **`<edge-time>`** - Time Display Component

- Real-time clock updates
- Configurable format (12h/24h)
- Locale-aware formatting
- Timezone support

### 3. **`<edge-date>`** - Date Display Component

- Locale-aware date formatting
- Multiple format options (short, long, etc.)
- Timezone support

### 4. **`<edge-card>`** - Content Card Component

- Consistent card styling
- Optional header/footer slots
- Glass morphism effects
- Responsive padding

### 5. **`<edge-chip>`** - Badge/Chip Component

- Small informational badges
- Status indicators
- Icon + text support

### 6. **`<edge-weather>`** - Weather Display Component

- Current temperature
- Weather icon
- Location display
- Optional forecast

## Component Guidelines

When creating new components:

1. **Use Web Components API** - Native custom elements for framework-agnostic usage
2. **TypeScript** - Full type safety
3. **Attributes for Configuration** - Use attributes for simple config, properties for complex
4. **Slots for Content** - Use slots for flexible content insertion
5. **CSS Custom Properties** - Allow styling via CSS variables
6. **Accessibility** - Include proper ARIA attributes and semantic HTML
7. **Documentation** - Include JSDoc comments and usage examples

## Example Component Structure

```typescript
export class MyComponent extends HTMLElement {
  static get observedAttributes() {
    return ['attr1', 'attr2']
  }

  connectedCallback() {
    this.render()
  }

  attributeChangedCallback() {
    this.render()
  }

  private render() {
    // Component rendering logic
  }
}

if (typeof window !== 'undefined' && !customElements.get('my-component')) {
  customElements.define('my-component', MyComponent)
}
```
