# Edge Apps Generator

A standalone generator for creating new Screenly Edge Apps with the Edge Apps Framework.

## Location

The generator is located at:
```
Playground/edge-app-generator/
```

## Usage

### From the generator directory:

```bash
cd edge-app-generator
bun run generate
```

Or directly:

```bash
node generate.js
```

### From anywhere (if installed globally):

```bash
edge-app-generate
```

## What It Does

The generator creates a new edge app in `Playground/edge-apps/` with:

- ✅ Complete app structure
- ✅ Framework core (copied from `weather/src/core/`)
- ✅ All configuration files (Vite, TypeScript, Tailwind, etc.)
- ✅ Screenly metadata files (optional)
- ✅ Static directory structure (if Screenly enabled)
- ✅ README with deployment instructions

## Requirements

The generator includes:
- ✅ Framework core (in `framework/` directory)
- ✅ All framework files (AutoScaler, SafeZones, DevTools, CSS, etc.)

The generator expects:
- Config files to be available at `../../weather/` (tsconfig.json, vite.config.ts, etc.)
  - These are copied from the weather app as templates

## Generated App Location

Apps are generated in:
```
Playground/edge-apps/{app-name}/
```

## Example

```bash
$ cd edge-app-generator
$ bun run generate

🚀 Edge Apps Generator

App name: clock
[Press Enter for all defaults]

📦 Generating app structure...
✓ Copied tsconfig.json
✓ Copied vite.config.ts
📦 Copying framework core...
📦 Creating Screenly metadata files...
✅ App generated successfully!

📁 Location: /path/to/Playground/edge-apps/clock

Next steps:
  cd edge-apps/clock
  bun install
  bun run dev
```

## Interactive Prompts

The generator will ask you a few questions. **Only the app name is required** - all other prompts have sensible defaults and can be skipped by pressing Enter.

### 1. App Name (Required)

**Prompt:** `App name (e.g., clock, dashboard):`

**What it does:**
- Sets the name of your app
- Used to create the directory name
- Will be sanitized (lowercase, hyphens instead of spaces)

**Examples:**
- `clock` → Creates `clock/` directory
- `news-ticker` → Creates `news-ticker/` directory
- `Weather Dashboard` → Creates `weather-dashboard/` directory

**Note:** This is the only required field. You must provide an app name.

---

### 2. Orientation (Optional - Default: landscape)

**Prompt:** `Orientation (landscape/portrait) [landscape]:`

**What it does:**
- Sets the **reference resolution** your app is designed for
- Determines the aspect ratio the AutoScaler uses for scaling

**Options:**
- **`landscape`** (default) - For horizontal screens
  - Reference resolution: **1920×1080** (Full HD)
  - Use for: TVs, wall-mounted displays, most digital signage
  - Press Enter to use this default
  
- **`portrait`** - For vertical screens
  - Reference resolution: **1080×1920**
  - Use for: Vertical displays, wayfinding kiosks, elevator displays

**How it works:**
- You design your app thinking it's the reference resolution (e.g., 1920×1080)
- The framework automatically scales it to fit any actual screen size
- Scaling maintains aspect ratio, so your design stays proportional

**Example:**
- You design at 1920×1080 (landscape)
- App runs on a 4K display (3840×2160)
- Framework scales it 2x to fit perfectly

**When to change:**
- Keep default (`landscape`) for most cases
- Choose `portrait` only if building for vertical displays

---

### 3. Custom Resolution (Optional - Default: No)

**Prompt:** `Use custom resolution? (y/N) [N]:`

**What it does:**
- Lets you override the default reference resolution
- Instead of 1920×1080 (landscape) or 1080×1920 (portrait), you can specify custom dimensions

**Default behavior:**
- Press Enter (or type `N`) to use defaults:
  - Landscape: 1920×1080
  - Portrait: 1080×1920

**If you choose Yes:**
- You'll be prompted for custom width and height
- Useful for non-standard displays or specific hardware requirements

**When to use:**
- **Usually skip this** - defaults work for 99% of cases
- Only use if:
  - Your target hardware has a specific resolution (e.g., 2560×1440)
  - You want to design at native 4K (3840×2160)
  - You have a custom display with non-standard dimensions

**Example:**
```
Use custom resolution? (y/N) [N]: y
Width [1920]: 3840
Height [1080]: 2160
```
This sets reference resolution to 4K instead of Full HD.

---

### 4. Dev Tools (Optional - Default: Yes)

**Prompt:** `Enable dev tools? (Y/n) [Y]:`

**What it does:**
- Enables or disables the **development overlay** for debugging

**What dev tools show:**
- Current viewport size (actual browser/screen dimensions)
- Reference resolution (what you designed for)
- Current scale factor (how much the app is scaled)
- Orientation (landscape/portrait)
- Safe zone boundaries (red dashed lines showing safe areas)

**Default behavior:**
- Press Enter (or type `Y`) to enable dev tools
- Type `n` to disable

**How to use:**
- **During development:** Keep enabled (default) - helps debug scaling issues
- **Press 'D' key** while running to toggle overlay on/off
- **For production:** Disable by typing `n` - you don't want debug info showing to end users


## Structure

```
edge-app-generator/
├── generate.js          # Main generator script
├── package.json         # Generator package config
├── README.md           # This file
└── framework/          # Framework core (included)
    ├── AutoScaler.ts
    ├── SafeZones.ts
    ├── EdgeAppDevTools.ts
    ├── types.ts
    ├── index.ts
    └── css/            # Framework CSS files
        ├── base.css
        ├── utilities.css
        └── edge-app.css
```

# Edge Apps Framework

The framework is **included in the generator** at:
```
edge-app-generator/framework/
```

This makes the generator completely self-contained - no need to reference external framework locations.


## Overview
A reusable framework for building digital signage applications (edge apps) that run on screens with consistent scaling, safe zones, and optimal readability.

## Core Components Required

### 1. **AutoScaler System (Vanilla JS/TS)**
   - **Purpose**: Automatically scale apps from reference resolution to actual screen size
   - **Implementation**: 
     - JavaScript/TypeScript class: `AutoScaler`
     - Initialize with reference resolution (width, height, orientation)
     - Auto-detect viewport dimensions on load and resize
     - Calculate optimal scale factor (maintain aspect ratio)
     - Apply CSS transform: scale() to target container element
     - Support both landscape (1920x1080) and portrait (1080x1920) reference resolutions
     - Handle edge cases (ultra-wide, square displays)
     - Optional: Center content with letterboxing/pillarboxing
   - **Usage**: `new AutoScaler(containerElement, options)`

### 2. **Safe Zone System**
   - **Purpose**: Prevent content cropping due to overscan
   - **Implementation**:
     - CSS utility classes (e.g., `.safe-zone`, `.safe-top`, `.safe-bottom`, etc.)
     - JavaScript utility functions for calculating safe areas
     - Configurable safe zone margins (default: 5% on all sides)
     - Visual safe zone guides (development mode only, via JS)
   - **Usage**: Add classes to HTML elements or use JS utilities

### 3. **Base HTML Structure & CSS**
   - **Purpose**: Standardized layout pattern for edge apps
   - **Implementation**:
     - Base CSS reset and utilities
     - Container classes for full viewport (100vh/100vw, no scroll)
     - Integration with AutoScaler via data attributes or JS initialization
     - Optional: Background utilities
   - **Usage**: Standard HTML structure with framework classes

### 4. **TypeScript Types & Configuration**
   - **Types**:
     - `EdgeAppConfig` - App configuration interface
     - `ReferenceResolution` - Resolution settings
     - `SafeZoneConfig` - Safe zone settings
     - `Orientation` - Landscape/Portrait enum
     - `AutoScalerOptions` - AutoScaler configuration
   - **Configuration**:
     - Default reference resolutions
     - Safe zone defaults
     - Scale calculation options
   - **Usage**: TypeScript definitions for type safety (optional, works with plain JS too)

### 5. **Build System & Tooling**
   - **Tech Stack**:
     - TypeScript
     - Tailwind CSS (with custom config for digital signage)
     - Vite (or similar) for fast dev/build
     - PostCSS for CSS processing
   - **Features**:
     - Hot module replacement for development
     - Production optimizations
     - Asset handling
     - Type checking

### 6. **Developer Utilities (Vanilla JS)**
   - **Dev Tools**:
     - `EdgeAppDevTools` class for development overlays
     - Safe zone overlay toggle (dev mode)
     - Resolution info display (dev mode)
     - Scale factor indicator (dev mode)
     - Orientation detection
   - **Helpers**:
     - Font scaling utilities (for readability)
     - Color contrast helpers
     - Spacing utilities aligned to reference resolution
   - **Usage**: `new EdgeAppDevTools()` to enable dev overlays

### 7. **Styling System**
   - **Tailwind CSS Configuration**:
     - Custom breakpoints (if needed for dev)
     - High contrast color palette
     - Typography scale optimized for distance viewing
     - Spacing system based on reference resolution
   - **CSS Utilities (Framework Classes)**:
     - Safe zone classes (`.safe-zone`, `.safe-top`, `.safe-left`, etc.)
     - Full viewport classes (`.edge-app-container`, `.edge-app-fullscreen`)
     - High contrast text utilities (`.text-high-contrast`, `.bg-high-contrast`)
     - Typography utilities (`.text-readable`, `.text-large`, etc.)
     - Layout utilities (`.flex-center`, `.grid`, etc.)
   - **Usage**: Add utility classes to HTML elements (Bootstrap-style)

# Build Process

The build command generates a production-ready `build/` directory with all files optimized and ready for deployment.

## Build Commands

### Standard Build

```bash
bun run build
```

This will:
1. Type-check TypeScript files
2. Compile TypeScript to JavaScript
3. Process CSS with Tailwind and PostCSS
4. Bundle and optimize all assets
5. Copy static files to `build/`
6. Copy Screenly metadata files (if present)

### Production Build

```bash
bun run build
```

## Build Output Structure

After running `bun run build`, you'll get:

```
build/
├── index.html              # Main HTML (with optimized asset references)
├── assets/
│   ├── main.[hash].js      # Bundled JavaScript (minified)
│   ├── main.[hash].css     # Processed CSS (minified)
│   └── [other assets]     # Images, fonts, etc.
├── static/                 # Static assets (copied as-is)
│   ├── images/
│   │   └── icon.svg
│   ├── fonts/
│   ├── js/
│   └── styles/
├── screenly.yml            # Screenly manifest (if present)
└── screenly_qc.yml         # Screenly QC manifest (if present)
```

## What Gets Built

### Processed Files (from `src/`)

- **TypeScript** → Compiled to JavaScript
- **CSS** → Processed with Tailwind, PostCSS, Autoprefixer
- **JavaScript modules** → Bundled and minified
- **Framework code** → Compiled and optimized

### Static Files (from `static/`)

- **Images** → Copied as-is
- **Fonts** → Copied as-is
- **Pre-built libraries** → Copied as-is
- **Other static assets** → Copied as-is

### Metadata Files

- **screenly.yml** → Copied to build/ (if exists)
- **screenly_qc.yml** → Copied to build/ (if exists)

## Build Configuration

The build is configured in `vite.config.ts`:

- **Output directory**: `build/`
- **Public directory**: `static/` (copied to build/static/)
- **Asset optimization**: Enabled
- **Code minification**: Enabled
- **Source maps**: Disabled in production

## Deployment

### For Screenly

The `build/` directory is ready to deploy directly to Screenly:

```bash
# Build the app
bun run build

# Deploy to Screenly (from build/ directory)
cd build
screenly edge-app deploy
```

### For Other Platforms

The `build/` directory contains:
- All HTML, CSS, and JavaScript files
- All static assets
- Optimized and minified code
- Ready to serve from any static file server

## Preview Build

To preview the production build locally:

```bash
bun run preview
```

This serves the `build/` directory on a local server so you can test the production build.

## Build Optimization

The build process includes:

1. **Code splitting** - Separate chunks for better caching
2. **Tree shaking** - Removes unused code
3. **Minification** - Reduces file sizes
4. **Asset optimization** - Compressed images and fonts
5. **CSS optimization** - Purged unused Tailwind classes
6. **Source maps** - Disabled in production for smaller files