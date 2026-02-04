/**
 * Screen Utilities
 * Utilities for screen orientation, dimensions, and other screen-related functions
 */

/**
 * Check if the current screen orientation is portrait
 * @returns true if portrait, false if landscape
 */
export function isPortrait(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return window.matchMedia('(orientation: portrait)').matches
}

/**
 * Check if the current screen orientation is landscape
 * @returns true if landscape, false if portrait
 */
export function isLandscape(): boolean {
  if (typeof window === 'undefined') {
    return true // Default to landscape for SSR
  }
  return window.matchMedia('(orientation: landscape)').matches
}

/**
 * Get the current screen orientation
 * @returns 'portrait' | 'landscape'
 */
export function getOrientation(): 'portrait' | 'landscape' {
  return isPortrait() ? 'portrait' : 'landscape'
}
