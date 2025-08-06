# Google Calendar Edge App (Vue + TypeScript)

This is a Vue 3 + TypeScript implementation of the Google Calendar Edge App, migrated from the legacy React/JavaScript version.

## Migration Overview

This app has been migrated from React/JavaScript to Vue 3/TypeScript with the following improvements:

### Technology Stack
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Pinia** for state management (avoiding props drilling)
- **Vite** for build tooling
- **SCSS/CSS** for styling (preserved from legacy version)

### Key Features
- **Multiple Calendar Views**: Monthly, Daily, and Weekly views
- **Google Calendar API Integration**: Supports both API and iCal sources
- **Responsive Design**: Supports landscape and portrait displays
- **Analog Clock**: Beautiful analog clock component
- **Timezone Support**: Automatic timezone detection and locale formatting
- **Branding Support**: Custom logos and theming
- **Sentry Integration**: Error tracking and monitoring

### Architecture

#### State Management (Pinia Store)
The app uses a centralized Pinia store (`src/stores/calendar.ts`) to manage:
- Calendar events
- Current time and date information
- User locale and timezone
- Calendar mode (monthly/daily/weekly)
- Authentication tokens for Google Calendar API

#### Components Structure
```
src/
├── components/
│   ├── AnalogClock.vue          # Analog clock display
│   ├── CalendarOverview.vue     # Monthly calendar grid
│   ├── DailyCalendarView.vue    # Daily schedule view
│   ├── InfoCard.vue             # Branding/logo component
│   ├── MonthlyCalendarView.vue  # Monthly events list
│   ├── TimeDisplay.vue          # Event time formatter
│   ├── WeeklyCalendarView.vue   # Weekly schedule view
│   └── WeeklyTimeDisplay.vue    # Weekly time formatter
├── stores/
│   └── calendar.ts              # Pinia store for state management
├── assets/                      # CSS/SCSS files (preserved from legacy)
├── constants.ts                 # App constants and types
├── events.ts                    # Calendar event fetching logic
├── utils.ts                     # Utility functions
└── main.ts                      # App initialization
```

#### Key Improvements Over Legacy Version
1. **Type Safety**: Full TypeScript implementation with proper interfaces
2. **Better State Management**: Pinia store eliminates props drilling
3. **Component Composition**: Cleaner component structure with Vue 3 Composition API
4. **Scoped Styles**: Each component has its own scoped styles
5. **Better Error Handling**: Improved error boundaries and fallbacks
6. **Modern Build System**: Vite for faster development and building

### Calendar Modes

#### Monthly View
- Displays upcoming events for the next 24 hours
- Shows current day of the week
- Includes a monthly calendar overview

#### Daily View
- Shows a 12-hour time slot view
- Displays events with proper time positioning
- Visual indicators for events extending beyond visible hours

#### Weekly View
- Full week view with 7-day grid
- Time slots with events positioned accurately
- Current day highlighting

### Configuration

The app reads configuration from `screenly.settings`:

```typescript
interface Settings {
  calendar_mode: 'monthly' | 'daily' | 'weekly'
  calendar_source_type: 'api' | 'ical'
  calendar_id: string           // For Google Calendar API
  ical_url: string             // For iCal feeds
  refresh_token: string        // Google OAuth refresh token
  client_id: string           // Google OAuth client ID
  client_secret: string       // Google OAuth client secret
  theme: 'light' | 'dark'
  screenly_color_accent: string
  screenly_logo_light: string
  screenly_logo_dark: string
  sentry_dsn?: string
}
```

### Development

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Type checking
bun run type-check

# Build for production
bun run build

# Preview production build
bun run preview
```

### Deployment

The app builds to the `dist/` directory and can be deployed as a standard Edge App:

```bash
bun run build
screenly edge-app deploy --path dist/
```

### Styling

The app preserves all original styling from the legacy version:
- `src/assets/common.css` - Common styles
- `src/assets/style.css` - Main application styles
- `src/assets/*.scss` - Component-specific SCSS files
- `src/assets/*.css` - Component-specific CSS files

### Browser Support

The app supports all modern browsers and is optimized for digital signage displays with various resolutions:
- 800x480 (landscape)
- 1280x720 (HD)
- 1920x1080 (Full HD)
- 3840x2160 (4K)
- Portrait orientations

### Error Handling

- Graceful fallbacks for network failures
- Proper error logging with Sentry integration
- Loading states for all async operations
- Fallback time formatting for locale issues
