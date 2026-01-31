# Plan: Merge Blueprint into Edge-Apps-Library

## Goal
Migrate Vue components, stores, and SCSS from `edge-apps/blueprint/` into `edge-apps/edge-apps-library/`, creating a new `vue` submodule that can be imported as:

```typescript
import { DigitalClock, AnalogClock, TopBar } from '@screenly/edge-apps/vue'
```

## Overview

The blueprint package contains:
- 12 Vue components (clocks, cards, calendar views, icons)
- 2 Pinia stores (settings, metadata)
- SCSS with variables, mixins, and responsive breakpoints
- Vue-specific utilities (calendar, sentry, event layout)

The edge-apps-library currently:
- Has no Vue support (pure TypeScript utilities)
- Uses `tsc` for building (won't work with `.vue` files)
- Already has similar utilities (locale, metadata, settings)

## Directory Structure

```
edge-apps-library/src/
├── index.ts              # Existing
├── types/                # Existing
├── utils/                # Existing
├── test/                 # Existing
└── vue/                  # NEW
    ├── index.ts          # Vue module entry point
    ├── components/
    │   ├── index.ts
    │   ├── AnalogClock.vue
    │   ├── BrandLogoCard.vue
    │   ├── DateDisplay.vue
    │   ├── DigitalClock.vue
    │   ├── InfoCard.vue
    │   ├── PrimaryCard.vue
    │   ├── TopBar.vue
    │   ├── calendar/
    │   │   ├── index.ts
    │   │   ├── CalendarOverview.vue
    │   │   ├── DailyCalendarView.vue
    │   │   ├── EventTimeRange.vue
    │   │   ├── ScheduleCalendarView.vue
    │   │   └── WeeklyCalendarView.vue
    │   └── icons/
    │       ├── index.ts
    │       ├── CoordinatesIcon.vue
    │       ├── HardwareIcon.vue
    │       ├── NameIcon.vue
    │       └── VersionIcon.vue
    ├── stores/
    │   ├── index.ts
    │   ├── base-settings-store.ts
    │   └── metadata-store.ts
    ├── constants/
    │   ├── index.ts
    │   └── calendar.ts
    ├── utils/
    │   ├── index.ts
    │   ├── calendar.ts
    │   ├── event-layout-utils.ts
    │   └── sentry.ts
    └── styles/
        ├── _variables.scss
        ├── _mixins.scss
        ├── _base.scss
        └── calendar/
            ├── _calendar-overview.scss
            ├── _daily-calendar-view.scss
            ├── _weekly-calendar-view.scss
            └── _schedule-calendar-view.scss
```

## Implementation Steps

### Phase 1: Build Infrastructure

1. **Update package.json** - Add dependencies and exports:
   - Peer dependencies: `vue`, `pinia`, `@sentry/vue`, `dayjs`
   - Dev dependencies: `@vitejs/plugin-vue`, `vue-tsc`, `@vue/test-utils`, `sass-embedded`, `vitest`
   - New exports: `./vue`, `./vue/components`, `./vue/stores`, `./vue/styles/*`

2. **Create vite.lib.config.ts** - Vite library build for Vue:
   - Multiple entry points (vue/index, vue/components/index, etc.)
   - External: vue, pinia, @sentry/vue, dayjs
   - Output to `dist-vue/`
   - SCSS preprocessing with shared variables/mixins

3. **Create tsconfig.vue.json** - Vue-specific TypeScript config:
   - Extends `@vue/tsconfig/tsconfig.dom.json`
   - Includes `src/vue/**/*.ts` and `src/vue/**/*.vue`

4. **Update tsconfig.json** - Exclude Vue files from tsc:
   - Add `src/vue/**/*.vue` to exclude

5. **Update build scripts**:
   - `build:vue`: `vite build --config vite.lib.config.ts`
   - `build`: `bun run build:types && bun run build:vue`
   - `type-check`: `tsc --noEmit && vue-tsc --noEmit -p tsconfig.vue.json`

### Phase 2: SCSS Migration

6. **Split base.scss into partials**:
   - `_variables.scss`: Colors, spacing, breakpoints, border-radius
   - `_mixins.scss`: Layout mixins (srly-card-base, srly-responsive-spacing, etc.)
   - `_base.scss`: Font-face, reset, CSS custom properties

7. **Copy calendar SCSS files** to `src/vue/styles/calendar/`

### Phase 3: Utilities and Constants

8. **Copy constants/calendar.ts** - Calendar types and enums

9. **Copy Vue-specific utils**:
   - `calendar.ts` - Update to use library's `getLocale()`
   - `event-layout-utils.ts` - Direct copy
   - `sentry.ts` - Direct copy (Vue-specific Sentry init)

### Phase 4: Stores Migration

10. **Copy and update stores**:
    - `base-settings-store.ts` - Update imports
    - `metadata-store.ts` - Use library's `formatCoordinates()`

### Phase 5: Components Migration

11. **Copy all Vue components**:
    - Standalone: AnalogClock, BrandLogoCard, DateDisplay, DigitalClock, InfoCard, PrimaryCard, TopBar
    - Calendar: CalendarOverview, DailyCalendarView, EventTimeRange, ScheduleCalendarView, WeeklyCalendarView
    - Icons: CoordinatesIcon, HardwareIcon, NameIcon, VersionIcon

12. **Update component imports**:
    - Change SCSS imports to `@/vue/styles/...`
    - Change utility imports to use library where applicable

### Phase 6: Entry Points and Testing

13. **Create index.ts files**:
    - `src/vue/index.ts` - Main entry, exports all
    - `src/vue/components/index.ts` - All components
    - `src/vue/stores/index.ts` - All stores
    - `src/vue/utils/index.ts` - Vue-specific utils
    - `src/vue/constants/index.ts` - Constants

14. **Setup vitest.config.ts** for Vue component testing

15. **Update test/mock.ts** - Merge blueprint's Vitest mock functionality

### Phase 7: Finalization

16. **Update README.md** with Vue usage docs

17. **Test the build** - Verify all exports work correctly

18. **Add Vue build commands to edge-apps-scripts** - Extend CLI for Vue apps

19. **Delete blueprint directory** - Remove `edge-apps/blueprint/` after successful migration

## Key Files to Modify

- `edge-apps-library/package.json` - Dependencies, exports, scripts
- `edge-apps-library/tsconfig.json` - Exclude Vue files
- `edge-apps-library/src/test/mock.ts` - Merge Vitest mock

## Key Files to Create

- `edge-apps-library/vite.lib.config.ts`
- `edge-apps-library/tsconfig.vue.json`
- `edge-apps-library/vitest.config.ts`
- All files under `edge-apps-library/src/vue/`

## Utility Deduplication

**Priority: Maximize reuse of existing library utilities.** Vue components and stores should import from `@screenly/edge-apps` rather than duplicating functionality.

| Blueprint | Library Equivalent | Action |
|-----------|-------------------|--------|
| `locale.ts` | `src/utils/locale.ts` | **Delete** - Use library's `getLocale()`, `getTimeZone()`, `formatLocalizedDate()`, `formatTime()`, `getLocalizedDayNames()`, `getLocalizedMonthNames()`, `detectHourFormat()` |
| `formatCoordinates()` | `src/utils/locale.ts` | **Delete** - Use library version |
| `getSettings()` | `src/utils/settings.ts` | **Delete** - Use library's `getSettings()`, `getSetting()`, `getTheme()` |
| `getMetadata()` | `src/utils/metadata.ts` | **Delete** - Use library's `getMetadata()`, `getScreenName()`, `getLocation()`, etc. |
| `calendar.ts` | N/A (calendar-specific) | Keep in vue/utils, but use library's locale functions internally |
| `event-layout-utils.ts` | N/A (calendar-specific) | Keep in vue/utils |
| `sentry.ts` | N/A (Vue-specific) | Keep in vue/utils (uses `@sentry/vue` instead of generic Sentry) |

### Stores Refactoring

**`metadata-store.ts`** should use:
```typescript
import { getMetadata, formatCoordinates } from '@screenly/edge-apps/utils'
```

**`base-settings-store.ts`** should use:
```typescript
import { getSettingWithDefault, getTheme, getCorsProxyUrl } from '@screenly/edge-apps/utils'

// Example: Use getSettingWithDefault for type-safe defaults
const logoUrl = getSettingWithDefault('logo_url', '/default-logo.svg')
const primaryColor = getSettingWithDefault('primary_color', '#972eff')
```

### Components Refactoring

Components like `TopBar.vue` and `DateDisplay.vue` should use:
```typescript
import { formatLocalizedDate, getLocale, getTimeZone } from '@screenly/edge-apps/utils'
```

## CLI Build Commands for Vue Apps

The existing `edge-apps-scripts` CLI has `build` and `build:dev` commands that use Vite for vanilla JS/TS apps. For Vue-based apps, we need Vue-specific build commands.

**Recommended approach: Extend existing commands with auto-detection**

Rather than adding separate `build:vue` commands, the cleaner developer experience is to have `build` and `build:dev` automatically detect Vue usage and apply the appropriate configuration. This means:

1. **Same commands**: `edge-apps-scripts build` and `edge-apps-scripts build:dev`
2. **Auto-detect Vue**: Check if the app has Vue dependencies or `.vue` files
3. **Apply Vue config**: If Vue detected, use Vue-enabled Vite config (includes `@vitejs/plugin-vue`)

**Implementation in `scripts/cli.ts`**:

```typescript
async function buildCommand(args: string[]) {
  const callerDir = process.cwd()

  // Detect if this is a Vue app
  const isVueApp = await detectVueApp(callerDir)

  // Use appropriate config
  const configPath = isVueApp
    ? path.resolve(libraryRoot, 'vite.vue.config.ts')
    : path.resolve(libraryRoot, 'vite.config.ts')

  // ... rest of build logic
}

async function detectVueApp(dir: string): Promise<boolean> {
  // Check for .vue files in src/
  // Or check package.json for vue dependency
}
```

**Files to create**:
- `vite.vue.config.ts` - Vite config with Vue plugin, SCSS preprocessing

**Why this approach**:
- Simpler DX: developers don't need to remember different commands
- Consistent: same workflow for all Edge Apps
- Discoverable: `--help` doesn't get cluttered with Vue-specific commands
- Future-proof: can add React, Svelte, etc. the same way

## Verification

1. Build succeeds: `bun run build`
2. Type check passes: `bun run type-check`
3. Tests pass: `bun run test`
4. Import works:
   ```typescript
   import { DigitalClock, TopBar } from '@screenly/edge-apps/vue'
   import { useSettingsStore } from '@screenly/edge-apps/vue/stores'
   ```
5. SCSS customization works:
   ```scss
   @use '@screenly/edge-apps/vue/styles/variables' with (
     $srly-color-primary: #custom
   );
   ```
