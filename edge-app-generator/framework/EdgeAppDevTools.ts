import type { AutoScalerOptions } from './types';
import { SafeZones } from './SafeZones';

/**
 * Development tools for edge apps
 * Provides overlays for safe zones, resolution info, and scale factor
 */
export class EdgeAppDevTools {
  private overlay: HTMLElement | null = null;
  private infoPanel: HTMLElement | null = null;
  private safeZoneOverlay: HTMLElement | null = null;
  private isVisible: boolean = false;
  private autoScalerOptions?: AutoScalerOptions;
  private scale: number = 1;

  constructor(autoScalerOptions?: AutoScalerOptions) {
    this.autoScalerOptions = autoScalerOptions;

    // Only show in development (check for common dev indicators)
    if (this.isDevelopmentMode()) {
      this.createOverlay();
      this.toggle();
    }
  }

  private isDevelopmentMode(): boolean {
    return (
      (import.meta as any).env?.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('dev=true')
    );
  }

  private createOverlay(): void {
    // Create main overlay container
    this.overlay = document.createElement('div');
    this.overlay.id = 'edge-app-dev-tools';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.overlay);

    // Create safe zone overlay
    this.createSafeZoneOverlay();

    // Create info panel
    this.createInfoPanel();

    // Update info on resize
    window.addEventListener('resize', () => this.updateInfo());
    this.updateInfo();
  }

  private createSafeZoneOverlay(): void {
    this.safeZoneOverlay = document.createElement('div');
    
    const safeZone = SafeZones.getSafeZoneDimensions();
    
    // Create overlay that shows safe zone boundaries on all sides
    this.safeZoneOverlay.style.cssText = `
      position: absolute;
      top: ${safeZone.top};
      left: ${safeZone.left};
      right: ${safeZone.right};
      bottom: ${safeZone.bottom};
      border: 2px dashed rgba(255, 0, 0, 0.5);
      box-sizing: border-box;
      pointer-events: none;
    `;

    this.overlay?.appendChild(this.safeZoneOverlay);
  }

  private createInfoPanel(): void {
    this.infoPanel = document.createElement('div');
    this.infoPanel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 12px 16px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.6;
      pointer-events: auto;
      user-select: none;
      min-width: 200px;
    `;
    this.overlay?.appendChild(this.infoPanel);
  }

  private updateInfo(): void {
    if (!this.infoPanel) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const refWidth = this.autoScalerOptions?.referenceWidth || 1920;
    const refHeight = this.autoScalerOptions?.referenceHeight || 1080;

    this.infoPanel.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #00ff00; padding-bottom: 4px;">
        Edge App Dev Tools
      </div>
      <div><strong>Viewport:</strong> ${viewportWidth} × ${viewportHeight}px</div>
      <div><strong>Reference:</strong> ${refWidth} × ${refHeight}px</div>
      <div><strong>Scale:</strong> ${this.scale.toFixed(3)}</div>
      <div><strong>Orientation:</strong> ${viewportWidth >= viewportHeight ? 'Landscape' : 'Portrait'}</div>
      <div style="margin-top: 8px; font-size: 10px; color: #888;">
        Press 'D' to toggle
      </div>
    `;
  }

  /**
   * Toggle visibility of dev tools
   */
  public toggle(): void {
    this.isVisible = !this.isVisible;
    if (this.overlay) {
      this.overlay.style.display = this.isVisible ? 'block' : 'none';
    }
  }

  /**
   * Show dev tools
   */
  public show(): void {
    this.isVisible = true;
    if (this.overlay) {
      this.overlay.style.display = 'block';
    }
  }

  /**
   * Hide dev tools
   */
  public hide(): void {
    this.isVisible = false;
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
  }

  /**
   * Update scale value (called by AutoScaler)
   */
  public updateScale(scale: number): void {
    this.scale = scale;
    this.updateInfo();
  }

  /**
   * Destroy dev tools and clean up
   */
  public destroy(): void {
    if (this.overlay) {
      this.overlay.remove();
    }
    window.removeEventListener('resize', () => this.updateInfo());
  }
}

// Add keyboard shortcut to toggle dev tools
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === 'd' || e.key === 'D') {
      const devTools = (window as any).__edgeAppDevTools;
      if (devTools) {
        devTools.toggle();
      }
    }
  });
}

