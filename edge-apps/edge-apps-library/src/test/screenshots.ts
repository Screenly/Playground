/**
 * Screenshot testing utilities and constants
 */

/**
 * Standard resolutions for screenshot testing
 * Covers all supported Screenly player resolutions
 */
export const RESOLUTIONS = [
  { width: 4096, height: 2160 },
  { width: 2160, height: 4096 },
  { width: 3840, height: 2160 },
  { width: 2160, height: 3840 },
  { width: 1920, height: 1080 },
  { width: 1080, height: 1920 },
  { width: 1280, height: 720 },
  { width: 720, height: 1280 },
  { width: 800, height: 480 },
  { width: 480, height: 800 },
] as const
