/**
 * Web Components for Edge Apps
 * Reusable UI components that can be used across multiple apps
 */

export { AppHeader } from './app-header/app-header.js'
export { AutoScalerElement } from './auto-scaler/auto-scaler.js'
export { BrandLogo } from './brand-logo/brand-logo.js'
export { EdgeAppDevToolsElement } from './dev-tools/dev-tools.js'
export { WeeklyCalendarView } from './weekly-calendar-view/index.js'
export type { CalendarEvent } from './weekly-calendar-view/index.js'

// Side-effect: Register all components when this module is imported
import './register.js'
