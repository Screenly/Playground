# Migration Comparison: Old Generator vs New Setup

## Overview

This document compares the old `@edge-app-generator` with the new simplified setup using `@screenly/edge-apps` library + blueprint.

## ✅ Feature Parity

| Feature | Old Generator | New Setup | Status |
|---------|---------------|-----------|--------|
| **AutoScaler** | ✅ Framework core | ✅ `@screenly/edge-apps/core` | ✅ Complete |
| **SafeZones** | ✅ Framework core | ✅ `@screenly/edge-apps/core` | ✅ Complete |
| **EdgeAppDevTools** | ✅ Framework core | ✅ `@screenly/edge-apps/core` | ✅ Complete |
| **Platform Utils** | ❌ None | ✅ `@screenly/edge-apps` (settings, theme, metadata, locale, UTM) | ✅ Enhanced |
| **Fixed Positioning** | ✅ `position: fixed` | ✅ `position: fixed` | ✅ Complete |
| **Centering** | ✅ Calculated offsets | ✅ Calculated offsets | ✅ Complete |
| **Orientation Support** | ✅ Auto/landscape/portrait | ✅ Auto/landscape/portrait | ✅ Complete |
| **System Fonts** | ✅ System font stack | ✅ System font stack | ✅ Complete |
| **Font Smoothing** | ✅ `-webkit-font-smoothing` | ✅ Added | ✅ Complete |
| **User Selection** | ✅ `user-select: none` | ✅ Added | ✅ Complete |
| **Tailwind CSS** | ✅ Configured | ✅ Configured | ✅ Complete |
| **PostCSS** | ✅ autoprefixer | ✅ autoprefixer | ✅ Complete |
| **TypeScript** | ✅ Configured | ✅ Configured | ✅ Complete |
| **Vite** | ✅ Dev + build | ✅ Dev + build | ✅ Complete |
| **Hot Module Replacement** | ⚠️ Limited (build during dev) | ✅ Full HMR (source compilation) | ✅ Enhanced |
| **Screenly Integration** | ✅ screenly.yml, mock data | ✅ screenly.yml, mock data | ✅ Complete |

## 🎯 Key Improvements in New Setup

### 1. **No Separate Library Build Step**
- **Old:** Had to run `bun run build` in library before using
- **New:** Library source compiles with app via Vite → instant changes

### 2. **True Hot Module Replacement**
- **Old:** `build:dev` script compiled files during development
- **New:** Vite serves TypeScript directly → faster dev cycle

### 3. **Better Module Organization**
- **Old:** Framework copied to each app as `src/core/`
- **New:** Shared library via workspace dependency → single source of truth

### 4. **Platform Integration Utilities**
- **Old:** No built-in helpers for Screenly platform
- **New:** `@screenly/edge-apps` includes settings, theme, metadata, locale, UTM helpers

### 5. **Simplified Generator**
- **Old:** 762 lines, complex templating, many options
- **New:** ~120 lines, simple copy + replace, minimal config

## ⚠️ Intentional Changes

### Removed Utility Classes (Replaced by Tailwind)

The old generator included `framework/css/utilities.css` with classes like:
- `edge-app-flex`, `edge-app-flex-center` → Use Tailwind `flex items-center justify-center`
- `edge-app-fullscreen` → Use Tailwind `w-full h-full`
- `safe-zone` → Use `SafeZones` class from library or Tailwind padding
- `text-large`, `text-xl`, etc. → Use Tailwind `text-*` classes
- Positioning classes → Use Tailwind positioning utilities

**Rationale:** Tailwind provides all these utilities out of the box, so duplicating them as custom classes adds unnecessary complexity.

### Digital Signage Enhancements Kept

We **kept** these important digital signage-specific features:
- ✅ `user-select: none` (prevents accidental text selection on touchscreens)
- ✅ Font smoothing (better rendering on screens)
- ✅ Overflow hidden (prevents scrollbars)
- ✅ Fixed positioning (ensures content stays in viewport)

## 📝 Additional Utility Classes (Optional)

If you need glassmorphism or other effects, add them to your app's `styles.css`:

```css
/* Glassmorphism effect (frosted glass panels) */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

Or add them to your `tailwind.config.js`:

```js
export default {
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
      })
    },
  ],
}
```

## 🚀 Migration Path

For existing apps generated with the old generator:

1. **Install the library dependency:**
   ```bash
   # In your app directory
   bun add @screenly/edge-apps@workspace:../edge-apps-library
   ```

2. **Update imports:**
   ```ts
   // Old
   import { initEdgeApp } from './core/index'
   
   // New
   import { initEdgeApp } from '@screenly/edge-apps'
   ```

3. **Remove copied framework:**
   ```bash
   rm -rf src/core/
   ```

4. **Update Vite config** to resolve library source:
   ```ts
   import path from 'path'
   
   export default defineConfig({
     resolve: {
       alias: {
         '@screenly/edge-apps': path.resolve(__dirname, '../edge-apps-library/src/index.ts'),
       },
     },
   })
   ```

5. **Add digital signage CSS** (if missing):
   ```css
   /* Prevent text selection for digital signage */
   #app * {
     user-select: none;
     -webkit-user-select: none;
     -moz-user-select: none;
   }
   ```

## 📊 Comparison Summary

| Aspect | Old Generator | New Setup |
|--------|---------------|-----------|
| **Lines of code** | 762 | ~120 |
| **Dev workflow** | Install → Build library → Dev | Install → Dev |
| **Library updates** | Rebuild library | Instant (HMR) |
| **Code duplication** | Each app has framework copy | Shared library |
| **Platform helpers** | Manual screenly.* access | Typed helper functions |
| **Complexity** | High (many options, templating) | Low (simple copy + replace) |
| **Maintenance** | Update each app separately | Update library once |

## ✅ Conclusion

The new setup achieves **full feature parity** with the old generator while providing:
- Faster development (no build step, true HMR)
- Better maintainability (shared library)
- More platform integration (typed helpers)
- Simpler generator (easier to understand and modify)

The only "missing" features are utility CSS classes that Tailwind already provides, which simplifies the codebase without losing functionality.

