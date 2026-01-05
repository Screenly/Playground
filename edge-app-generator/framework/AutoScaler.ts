import type { AutoScalerOptions } from './types';

/**
 * AutoScaler class - Automatically scales content from reference resolution to actual viewport
 */
export class AutoScaler {
  private container: HTMLElement;
  private options: Required<Pick<AutoScalerOptions, 'referenceWidth' | 'referenceHeight' | 'centerContent' | 'debounceMs'>> & Pick<AutoScalerOptions, 'orientation' | 'onScaleChange'>;
  private currentScale: number = 1;
  private resizeObserver?: ResizeObserver;
  private resizeTimeout?: number;

  constructor(container: HTMLElement, options: AutoScalerOptions) {
    this.container = container;
    this.options = {
      referenceWidth: options.referenceWidth,
      referenceHeight: options.referenceHeight,
      orientation: options.orientation || 'auto',
      centerContent: options.centerContent ?? true,
      debounceMs: options.debounceMs ?? 100,
      onScaleChange: options.onScaleChange,
    };

    this.init();
  }

  private init(): void {
    // Set initial container styles
    this.container.style.width = `${this.options.referenceWidth}px`;
    this.container.style.height = `${this.options.referenceHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.transformOrigin = 'top left';

    // Calculate and apply initial scale
    this.calculateAndApplyScale();

    // Set up resize handling
    this.setupResizeHandling();
  }

  private calculateAndApplyScale(): void {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine orientation
    let orientation: 'landscape' | 'portrait';
    if (this.options.orientation === 'auto' || !this.options.orientation) {
      orientation = viewportWidth >= viewportHeight ? 'landscape' : 'portrait';
    } else {
      orientation = this.options.orientation;
    }

    // Calculate scale based on orientation
    let scaleX: number;
    let scaleY: number;

    if (orientation === 'landscape') {
      scaleX = viewportWidth / this.options.referenceWidth;
      scaleY = viewportHeight / this.options.referenceHeight;
    } else {
      // Portrait mode - swap reference dimensions
      scaleX = viewportWidth / this.options.referenceHeight;
      scaleY = viewportHeight / this.options.referenceWidth;
    }

    // Use the smaller scale to ensure content fits
    const scale = Math.min(scaleX, scaleY);

    // Apply scale
    if (scale !== this.currentScale) {
      this.currentScale = scale;
      this.container.style.transform = `scale(${scale})`;

      // Center content if requested
      if (this.options.centerContent) {
        const scaledWidth = this.options.referenceWidth * scale;
        const scaledHeight = this.options.referenceHeight * scale;
        
        const offsetX = (viewportWidth - scaledWidth) / 2;
        const offsetY = (viewportHeight - scaledHeight) / 2;

        this.container.style.left = `${offsetX}px`;
        this.container.style.top = `${offsetY}px`;
      } else {
        this.container.style.left = '0px';
        this.container.style.top = '0px';
      }

      // Call callback if provided
      if (this.options.onScaleChange) {
        this.options.onScaleChange(scale);
      }
    }
  }

  private setupResizeHandling(): void {
    // Use ResizeObserver if available, fallback to window resize
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.debouncedResize();
      });
      this.resizeObserver.observe(document.body);
    } else {
      window.addEventListener('resize', () => {
        this.debouncedResize();
      });
    }
  }

  private debouncedResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = window.setTimeout(() => {
      this.calculateAndApplyScale();
    }, this.options.debounceMs);
  }

  /**
   * Get current scale factor
   */
  public getScale(): number {
    return this.currentScale;
  }

  /**
   * Manually trigger scale recalculation
   */
  public recalculate(): void {
    this.calculateAndApplyScale();
  }

  /**
   * Destroy the AutoScaler instance and clean up
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    window.removeEventListener('resize', this.debouncedResize);
  }
}

