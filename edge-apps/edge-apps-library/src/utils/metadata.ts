import type { ScreenlyMetadata } from '../types/index.js'
import { Hardware } from '../types/index.js'
import { formatCoordinates } from './locale.js'

/**
 * Get the Screenly metadata
 */
export function getMetadata(): ScreenlyMetadata {
  return screenly.metadata
}

/**
 * Get formatted coordinates from metadata
 */
export function getFormattedCoordinates(): string {
  return formatCoordinates(screenly.metadata.coordinates)
}

/**
 * Get the screen name
 */
export function getScreenName(): string {
  return screenly.metadata.screen_name
}

/**
 * Get the hostname
 */
export function getHostname(): string {
  return screenly.metadata.hostname
}

/**
 * Get the location
 */
export function getLocation(): string {
  return screenly.metadata.location
}

/**
 * Get the hardware type
 */
export function getHardware(): Hardware {
  const hardware = screenly.metadata.hardware

  if (hardware === undefined) {
    return Hardware.Anywhere
  }

  if (hardware === 'Raspberry Pi') {
    return Hardware.RaspberryPi
  }

  if (hardware === 'Screenly Player Max') {
    return Hardware.ScreenlyPlayerMax
  }

  throw new Error(`Unknown hardware type: ${hardware}`)
}

/**
 * Get the Screenly version
 */
export function getScreenlyVersion(): string {
  return screenly.metadata.screenly_version
}

/**
 * Get the tags
 */
export function getTags(): string[] {
  return screenly.metadata.tags
}

/**
 * Check if a specific tag exists
 */
export function hasTag(tag: string): boolean {
  return screenly.metadata.tags.includes(tag)
}
