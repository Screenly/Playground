/**
 * <edge-app-devtools>
 *
 * Development overlay showing viewport, reference resolution, and scale.
 * Intended to be used alongside <auto-scaler>. Listens for the
 * `scalechange` event dispatched by the scaler.
 *
 * Usage:
 * ```html
 * <auto-scaler reference-width="1920" reference-height="1080">
 *   <!-- app content -->
 * </auto-scaler>
 * <edge-app-devtools reference-width="1920" reference-height="1080"></edge-app-devtools>
 * ```
 */
export class EdgeAppDevToolsElement extends HTMLElement {
  private infoPanel!: HTMLDivElement
  private isVisible = false
  private scale = 1

  private boundOnResize = () => this.updateInfo()
  private boundOnKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'd' || event.key === 'D') {
      this.toggle()
    }
  }
  private boundOnScaleChange = (event: Event) => {
    const detail = (event as CustomEvent<{ scale: number }>).detail
    if (detail && typeof detail.scale === 'number') {
      this.updateScale(detail.scale)
    }
  }

  static get observedAttributes() {
    return ['reference-width', 'reference-height']
  }

  constructor() {
    super()

    const shadow = this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    style.textContent = `
      :host {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        display: none;
      }

      :host([hidden]) {
        display: none;
      }

      .info-panel {
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
      }

      .info-panel__title {
        font-weight: bold;
        margin-bottom: 8px;
        border-bottom: 1px solid #00ff00;
        padding-bottom: 4px;
      }

      .info-panel__hint {
        margin-top: 8px;
        font-size: 10px;
        color: #888;
      }
    `

    this.infoPanel = document.createElement('div')
    this.infoPanel.className = 'info-panel'

    shadow.append(style, this.infoPanel)
  }

  connectedCallback() {
    this.upgradeProperty('referenceWidth')
    this.upgradeProperty('referenceHeight')

    if (!this.isDevelopmentMode()) {
      // In production we keep the element present but hidden
      this.hide()
      return
    }

    window.addEventListener('resize', this.boundOnResize)
    window.addEventListener('keydown', this.boundOnKeyDown)

    // Listen for scalechange events from <auto-scaler> elements
    // Events bubble up to document level, so we can listen there
    // This works whether auto-scaler is a parent or sibling
    document.addEventListener(
      'scalechange',
      this.boundOnScaleChange as EventListener,
    )

    this.show()
    this.updateInfo()
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.boundOnResize)
    window.removeEventListener('keydown', this.boundOnKeyDown)
    document.removeEventListener(
      'scalechange',
      this.boundOnScaleChange as EventListener,
    )
  }

  attributeChangedCallback(
    _name: string,
    _oldValue: string | null,
    _newValue: string | null,
  ) {
    if (!this.isConnected) return
    this.updateInfo()
  }

  private isDevelopmentMode(): boolean {
    const meta = import.meta as { env?: { DEV?: boolean } }
    return (
      meta.env?.DEV ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('dev=true')
    )
  }

  private upgradeProperty(prop: string) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const element = this as unknown as Record<string, unknown>
      const value = element[prop]

      delete element[prop]
      element[prop] = value
    }
  }

  private get referenceWidth(): number {
    const attr = this.getAttribute('reference-width')
    const value = attr ? Number(attr) : 1920
    return Number.isFinite(value) ? value : 1920
  }

  private get referenceHeight(): number {
    const attr = this.getAttribute('reference-height')
    const value = attr ? Number(attr) : 1080
    return Number.isFinite(value) ? value : 1080
  }

  private updateInfo() {
    if (!this.infoPanel) return

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const refWidth = this.referenceWidth
    const refHeight = this.referenceHeight

    this.infoPanel.innerHTML = `
      <div class="info-panel__title">Edge App Dev Tools</div>
      <div><strong>Viewport:</strong> ${viewportWidth} × ${viewportHeight}px</div>
      <div><strong>Reference:</strong> ${refWidth} × ${refHeight}px</div>
      <div><strong>Scale:</strong> ${this.scale.toFixed(3)}</div>
      <div><strong>Orientation:</strong> ${viewportWidth >= viewportHeight ? 'Landscape' : 'Portrait'}</div>
      <div class="info-panel__hint">Press 'D' to toggle</div>
    `
  }

  /**
   * Toggle visibility of dev tools.
   * Does not dispatch events in response to host setting properties,
   * in line with best practices.
   */
  public toggle() {
    this.isVisible = !this.isVisible
    this.style.display = this.isVisible ? 'block' : 'none'
  }

  public show() {
    this.isVisible = true
    this.style.display = 'block'
  }

  public hide() {
    this.isVisible = false
    this.style.display = 'none'
  }

  /**
   * Imperative API for AutoScaler or host code to update the scale.
   * Prefer listening to `scalechange` events on <auto-scaler>,
   * but this method is provided for compatibility.
   */
  public updateScale(scale: number) {
    this.scale = scale
    this.updateInfo()
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('edge-app-devtools')) {
  customElements.define('edge-app-devtools', EdgeAppDevToolsElement)
}
