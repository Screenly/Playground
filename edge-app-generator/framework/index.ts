/**
 * Edge Apps Framework
 * A vanilla JavaScript/TypeScript framework for building digital signage applications
 */

// Export types
export type {
  Orientation,
  ReferenceResolution,
  SafeZoneConfig,
  AutoScalerOptions,
  EdgeAppConfig,
} from './types';

// Export classes
export { AutoScaler } from './AutoScaler';
export { SafeZones } from './SafeZones';
export { EdgeAppDevTools } from './EdgeAppDevTools';

// Import classes for use in functions
import { AutoScaler } from './AutoScaler';
import { SafeZones } from './SafeZones';
import { EdgeAppDevTools } from './EdgeAppDevTools';

// Import CSS (will be processed by build system)
// CSS is imported via HTML link tag in the app

/**
 * Initialize an edge app with auto-scaling
 * Convenience function for quick setup
 */
export function initEdgeApp(
  containerId: string,
  options: {
    referenceWidth: number;
    referenceHeight: number;
    orientation?: 'landscape' | 'portrait' | 'auto';
    enableDevTools?: boolean;
    safeZone?: import('./types').SafeZoneConfig;
  }
): { scaler: import('./AutoScaler').AutoScaler; devTools?: import('./EdgeAppDevTools').EdgeAppDevTools } {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container element with id "${containerId}" not found`);
  }

  // Apply safe zone if specified
  if (options.safeZone) {
    SafeZones.applySafeZone(container, options.safeZone);
  }

  // Create dev tools first if enabled (so we can hook into scaler callback)
  let devTools: EdgeAppDevTools | undefined;
  let scaleCallback: ((scale: number) => void) | undefined;
  
  if (options.enableDevTools) {
    devTools = new EdgeAppDevTools({
      referenceWidth: options.referenceWidth,
      referenceHeight: options.referenceHeight,
      orientation: options.orientation,
    });
    (window as any).__edgeAppDevTools = devTools;
    scaleCallback = (scale: number) => {
      devTools?.updateScale(scale);
    };
  }

  // Create AutoScaler with dev tools callback
  const scaler = new AutoScaler(container, {
    referenceWidth: options.referenceWidth,
    referenceHeight: options.referenceHeight,
    orientation: options.orientation,
    onScaleChange: scaleCallback,
  });

  // Update dev tools with initial scale
  if (devTools) {
    devTools.updateScale(scaler.getScale());
  }

  return { scaler, devTools };
}

/**
 * Auto-initialize edge apps from data attributes
 * Call this after DOM is loaded to auto-initialize containers with data-edge-app attribute
 */
export function autoInitEdgeApps(): void {
  const containers = document.querySelectorAll('[data-edge-app]');
  
  containers.forEach((container) => {
    const element = container as HTMLElement;
    const refWidth = parseInt(element.dataset.refWidth || '1920', 10);
    const refHeight = parseInt(element.dataset.refHeight || '1080', 10);
    const orientation = (element.dataset.orientation || 'auto') as 'landscape' | 'portrait' | 'auto';
    const enableDevTools = element.dataset.enableDevTools === 'true';

    initEdgeApp(element.id || `edge-app-${Math.random().toString(36).substr(2, 9)}`, {
      referenceWidth: refWidth,
      referenceHeight: refHeight,
      orientation,
      enableDevTools,
    });
  });
}

// Auto-initialize on DOM ready if in browser
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitEdgeApps);
  } else {
    autoInitEdgeApps();
  }
}

// Export as default namespace
const EdgeApp = {
  AutoScaler,
  SafeZones,
  EdgeAppDevTools,
  init: initEdgeApp,
  autoInit: autoInitEdgeApps,
};

export default EdgeApp;

