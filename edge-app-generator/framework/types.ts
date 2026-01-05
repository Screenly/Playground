/**
 * Orientation type for edge apps
 */
export type Orientation = 'landscape' | 'portrait' | 'auto';

/**
 * Reference resolution configuration
 */
export interface ReferenceResolution {
  width: number;
  height: number;
  orientation?: Orientation;
}

/**
 * Safe zone configuration
 */
export interface SafeZoneConfig {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  all?: number | string;
}

/**
 * AutoScaler options
 */
export interface AutoScalerOptions {
  referenceWidth: number;
  referenceHeight: number;
  orientation?: Orientation;
  centerContent?: boolean;
  debounceMs?: number;
  onScaleChange?: (scale: number) => void;
}

/**
 * Edge app configuration
 */
export interface EdgeAppConfig {
  referenceResolution: ReferenceResolution;
  safeZone?: SafeZoneConfig;
  enableDevTools?: boolean;
}

