/**
 * <auto-scaler>
 *
 * Web component that automatically scales its slotted content from a reference
 * resolution to the current viewport.
 *
 * Usage:
 * ```html
 * <auto-scaler
 *   reference-width="1920"
 *   reference-height="1080"
 *   orientation="auto"
 *   center-content
 * >
 *   <!-- Your app content sized for 1920×1080 -->
 * </auto-scaler>
 * ```
 */
export class AutoScalerElement extends HTMLElement {
  private currentScale: number = 1
  private resizeObserver?: ResizeObserver
  private resizeTimeout?: number
  private boundDebouncedResize = () => this.debouncedResize()

  // Internal options derived from attributes
  private _referenceWidth?: number
  private _referenceHeight?: number
  private _orientation: 'landscape' | 'portrait' | 'auto' = 'auto'
  private _centerContent: boolean = true
  private _padding: string = '20'
  private _debounceMs: number = 100

  static get observedAttributes() {
    return [
      'reference-width',
      'reference-height',
      'orientation',
      'center-content',
      'padding',
      'debounce-ms',
    ]
  }

  constructor() {
    super()

    // Create shadow root for encapsulated styles (best practice)
    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = `
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none;
      }

      ::slotted(*) {
        /* Slotted content can assume a 1920×1080 canvas; AutoScaler rescales host */
      }
    `

    const slot = document.createElement('slot')
    shadow.append(style, slot)
  }

  connectedCallback() {
    // Handle properties that may have been set before upgrade
    this.upgradeProperty('referenceWidth')
    this.upgradeProperty('referenceHeight')

    this.loadAttributes()
    this.init()
  }

  disconnectedCallback() {
    this.teardown()
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ) {
    if (!this.isConnected) return

    // Recalculate when configuration changes
    if (AutoScalerElement.observedAttributes.includes(name)) {
      this.loadAttributes()
      this.init()
    }
  }

  /**
   * Upgrade any properties that were set on the instance before
   * the custom element definition was loaded.
   * See: https://web.dev/articles/custom-elements-best-practices
   */
  private upgradeProperty(prop: string) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const element = this as unknown as Record<string, unknown>
      const value = element[prop]

      delete element[prop]
      element[prop] = value
    }
  }

  private loadAttributes() {
    const refWidthAttr = this.getAttribute('reference-width')
    const refHeightAttr = this.getAttribute('reference-height')

    if (refWidthAttr && refHeightAttr) {
      const referenceWidth = Number(refWidthAttr)
      const referenceHeight = Number(refHeightAttr)

      if (Number.isFinite(referenceWidth) && Number.isFinite(referenceHeight)) {
        this._referenceWidth = referenceWidth
        this._referenceHeight = referenceHeight
      }
    }

    const orientationAttr = this.getAttribute('orientation')
    if (
      orientationAttr === 'landscape' ||
      orientationAttr === 'portrait' ||
      orientationAttr === 'auto'
    ) {
      this._orientation = orientationAttr
    } else {
      this._orientation = 'auto'
    }

    this._centerContent = this.hasAttribute('center-content')

    const paddingAttr = this.getAttribute('padding')
    if (paddingAttr && Number.isFinite(Number(paddingAttr))) {
      this._padding = String(Number(paddingAttr))
    } else {
      this._padding = '20'
    }

    const debounceMsAttr = this.getAttribute('debounce-ms')
    if (debounceMsAttr && Number.isFinite(Number(debounceMsAttr))) {
      this._debounceMs = Number(debounceMsAttr)
    } else {
      this._debounceMs = 100
    }
  }

  private init(): void {
    if (!this._referenceWidth || !this._referenceHeight) {
      return
    }

    // Set initial container styles
    this.style.width = `${this._referenceWidth}px`
    this.style.height = `${this._referenceHeight}px`
    this.style.padding = `${this._padding}px`
    this.style.position = 'fixed'
    this.style.top = '0px'
    this.style.transformOrigin = 'top left'
    this.style.overflow = 'hidden'

    // Calculate and apply initial scale
    this.calculateAndApplyScale()

    // Set up resize handling
    this.setupResizeHandling()
  }

  private calculateAndApplyScale(): void {
    if (!this._referenceWidth || !this._referenceHeight) {
      return
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight

    // Determine orientation
    let orientation: 'landscape' | 'portrait'
    if (this._orientation === 'auto' || !this._orientation) {
      orientation = viewportWidth >= viewportHeight ? 'landscape' : 'portrait'
    } else {
      orientation = this._orientation
    }

    // Set container dimensions based on orientation
    let effectiveWidth: number
    if (orientation === 'portrait') {
      // Swap dimensions for portrait
      this.style.width = `${this._referenceHeight}px`
      this.style.height = `${this._referenceWidth}px`
      effectiveWidth = this._referenceHeight
    } else {
      // Use original dimensions for landscape
      this.style.width = `${this._referenceWidth}px`
      this.style.height = `${this._referenceHeight}px`
      effectiveWidth = this._referenceWidth
    }

    // Set CSS variable for signage unit (su)
    // 1su = 1% of reference width (e.g., 1920px / 100 = 19.2px)
    const oneSU = effectiveWidth / 100
    this.style.setProperty('--su', `${oneSU}px`)

    // Calculate scale based on orientation
    let scaleX: number
    let scaleY: number

    if (orientation === 'landscape') {
      scaleX = viewportWidth / this._referenceWidth
      scaleY = viewportHeight / this._referenceHeight
    } else {
      // Portrait mode - swap reference dimensions
      scaleX = viewportWidth / this._referenceHeight
      scaleY = viewportHeight / this._referenceWidth
    }

    // Use the smaller scale to ensure content fits
    const scale = Math.min(scaleX, scaleY)

    // Apply scale transform
    this.style.transform = `scale(${scale})`

    // Calculate scaled dimensions (swap in portrait mode)
    let scaledWidth: number

    if (orientation === 'portrait') {
      scaledWidth = this._referenceHeight * scale
    } else {
      scaledWidth = this._referenceWidth * scale
    }

    // Always center horizontally when scaled content is smaller than viewport
    // This ensures content is centered for narrow screens like 480x800 portrait
    if (scaledWidth < viewportWidth) {
      const offsetX = (viewportWidth - scaledWidth) / 2
      this.style.left = `${offsetX}px`
    } else if (this._centerContent) {
      // If center-content is explicitly set, center even when content is larger
      const offsetX = (viewportWidth - scaledWidth) / 2
      this.style.left = `${offsetX}px`
    } else {
      this.style.left = '0px'
    }

    // Dispatch event and update scale if changed
    if (scale !== this.currentScale) {
      this.currentScale = scale
      this.dispatchEvent(
        new CustomEvent('scalechange', {
          detail: { scale },
          bubbles: true,
          composed: true,
        }),
      )
    }
  }

  private setupResizeHandling(): void {
    this.teardownResizeHandling()

    // Use ResizeObserver if available, fallback to window resize
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.debouncedResize()
      })
      this.resizeObserver.observe(document.body)
    } else {
      window.addEventListener('resize', this.boundDebouncedResize)
    }
  }

  private debouncedResize(): void {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
    }

    this.resizeTimeout = window.setTimeout(() => {
      this.calculateAndApplyScale()
    }, this._debounceMs)
  }

  private teardownResizeHandling(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = undefined
    }
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout)
      this.resizeTimeout = undefined
    }
    window.removeEventListener('resize', this.boundDebouncedResize)
  }

  private teardown(): void {
    this.teardownResizeHandling()
  }

  /**
   * Public API: get current scale factor
   */
  get scale(): number {
    return this.currentScale
  }

  /**
   * Manually trigger scale recalculation
   */
  public recalculate(): void {
    this.calculateAndApplyScale()
  }

  /**
   * Properties that reflect to attributes (primitive data).
   * Keeping them in sync matches platform behavior.
   */
  get referenceWidth(): number | undefined {
    return this._referenceWidth
  }

  set referenceWidth(value: number | undefined) {
    if (value === undefined || value === null) {
      this.removeAttribute('reference-width')
    } else {
      this.setAttribute('reference-width', String(value))
    }
  }

  get referenceHeight(): number | undefined {
    return this._referenceHeight
  }

  set referenceHeight(value: number | undefined) {
    if (value === undefined || value === null) {
      this.removeAttribute('reference-height')
    } else {
      this.setAttribute('reference-height', String(value))
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('auto-scaler')) {
  customElements.define('auto-scaler', AutoScalerElement)
}
