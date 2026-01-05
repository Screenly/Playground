import type { SafeZoneConfig } from './types';

/**
 * Safe zone utilities for preventing overscan cropping
 */
export class SafeZones {
  /**
   * Apply safe zone styles to an element
   */
  static applySafeZone(element: HTMLElement, config: SafeZoneConfig = {}): void {
    const defaultMargin = config.all || '5%';

    element.style.paddingTop = this.getValue(config.top || defaultMargin);
    element.style.paddingRight = this.getValue(config.right || defaultMargin);
    element.style.paddingBottom = this.getValue(config.bottom || defaultMargin);
    element.style.paddingLeft = this.getValue(config.left || defaultMargin);
  }

  /**
   * Get safe zone dimensions as an object
   */
  static getSafeZoneDimensions(config: SafeZoneConfig = {}): {
    top: string;
    right: string;
    bottom: string;
    left: string;
  } {
    const defaultMargin = config.all || '5%';

    return {
      top: this.getValue(config.top || defaultMargin),
      right: this.getValue(config.right || defaultMargin),
      bottom: this.getValue(config.bottom || defaultMargin),
      left: this.getValue(config.left || defaultMargin),
    };
  }

  /**
   * Calculate safe area width (reference width minus safe zones)
   */
  static getSafeWidth(referenceWidth: number, config: SafeZoneConfig = {}): number {
    const margins = this.getSafeZoneDimensions(config);
    const left = this.parseValue(margins.left, referenceWidth);
    const right = this.parseValue(margins.right, referenceWidth);
    return referenceWidth - left - right;
  }

  /**
   * Calculate safe area height (reference height minus safe zones)
   */
  static getSafeHeight(referenceHeight: number, config: SafeZoneConfig = {}): number {
    const margins = this.getSafeZoneDimensions(config);
    const top = this.parseValue(margins.top, referenceHeight);
    const bottom = this.parseValue(margins.bottom, referenceHeight);
    return referenceHeight - top - bottom;
  }

  /**
   * Convert value to CSS string (handles numbers and strings)
   */
  private static getValue(value: number | string): string {
    if (typeof value === 'number') {
      return `${value}px`;
    }
    return value;
  }

  /**
   * Parse a CSS value (px or percentage) to pixels
   */
  private static parseValue(value: string, reference: number): number {
    if (value.endsWith('%')) {
      const percent = parseFloat(value);
      return (reference * percent) / 100;
    } else if (value.endsWith('px')) {
      return parseFloat(value);
    }
    return parseFloat(value);
  }
}

