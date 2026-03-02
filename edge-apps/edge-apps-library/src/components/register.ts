/**
 * Side-effect import file to register all web components
 * Import this file to ensure all components are registered as custom elements
 */

import './brand-logo/brand-logo.js'
import './app-header/app-header.js'
import './auto-scaler/auto-scaler.js'
import './dev-tools/dev-tools.js'
import './weekly-calendar-view/weekly-calendar-view.js'

import { WeeklyCalendarView } from './weekly-calendar-view/weekly-calendar-view.js'

if (typeof window !== 'undefined' && !customElements.get('weekly-calendar-view')) {
  customElements.define('weekly-calendar-view', WeeklyCalendarView)
}
