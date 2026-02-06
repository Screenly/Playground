import { setupBrandingLogo, getScreenName } from '../../utils/index.js'

const htmlTemplate = `
<img alt="Brand Logo" />
<span class="brand-name"></span>
`

const cssTemplate = `
:host {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

:host([hidden]) {
  display: none;
}

img {
  height: var(--brand-logo-height, 32px);
  width: auto;
  max-width: var(--brand-logo-max-width, 120px);
  object-fit: contain;
  vertical-align: middle;
  padding-right: 0.75rem;
}

img[src=""],
img:not([src]) {
  display: none;
}

.brand-name {
  font-weight: 500;
  font-size: 1.25rem;
  letter-spacing: 0.025em;
  white-space: nowrap;
  vertical-align: middle;
}

.brand-name:empty {
  display: none;
}

@media (orientation: portrait) {
  .brand-name {
    font-size: 1.5rem;
  }
}
`

/**
 * BrandLogo Web Component
 * Displays the branding logo from Screenly settings with fallback to screen name
 *
 * Usage:
 * ```html
 * <brand-logo></brand-logo>
 * ```
 *
 * Attributes:
 * - `show-name` (optional): Show screen name alongside logo (default: false)
 * - `fallback-to-name` (optional): Show screen name if logo unavailable (default: true)
 * - `max-width` (optional): Maximum width for logo (default: "120px")
 * - `max-height` (optional): Maximum height for logo (default: "32px")
 */
export class BrandLogo extends HTMLElement {
  private logoUrl: string = ''
  private _showName: boolean = false
  private _fallbackToName: boolean = true
  private _maxWidth: string = '120px'
  private _maxHeight: string = '32px'

  static get observedAttributes() {
    return ['show-name', 'fallback-to-name', 'max-width', 'max-height']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.upgradeProperty('showName')
    this.upgradeProperty('fallbackToName')
    this.upgradeProperty('maxWidth')
    this.upgradeProperty('maxHeight')

    this.loadAttributes()
    this.render()
    this.loadLogo()
  }

  attributeChangedCallback() {
    this.loadAttributes()
    this.render()
  }

  private upgradeProperty(prop: string) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const element = this as unknown as Record<string, unknown>
      const value = element[prop]

      delete element[prop]
      element[prop] = value
    }
  }

  private loadAttributes() {
    this._showName = this.hasAttribute('show-name')
    this._fallbackToName = this.getAttribute('fallback-to-name') !== 'false'
    this._maxWidth = this.getAttribute('max-width') || '120px'
    this._maxHeight = this.getAttribute('max-height') || '32px'
    this.updateCssProperties()
  }

  private updateCssProperties() {
    this.style.setProperty('--brand-logo-height', this._maxHeight)
    this.style.setProperty('--brand-logo-max-width', this._maxWidth)
  }

  private async loadLogo() {
    try {
      const logoUrl = await setupBrandingLogo()
      this.logoUrl = logoUrl

      if (logoUrl) {
        this.updateLogo()
      } else if (this.fallbackToName) {
        this.updateFallback()
      }
    } catch (error) {
      console.warn('Failed to load branding logo:', error)
      if (this.fallbackToName) {
        this.updateFallback()
      }
    }
  }

  private updateLogo() {
    const img = this.shadowRoot!.querySelector('img') as HTMLImageElement | null
    const nameEl = this.shadowRoot!.querySelector(
      '.brand-name',
    ) as HTMLElement | null

    if (img) {
      img.src = this.logoUrl
      img.style.removeProperty('display')
    }

    if (nameEl && this._showName) {
      const screenName = getScreenName()
      if (screenName) {
        nameEl.textContent = screenName
        nameEl.style.removeProperty('display')
      }
    }
  }

  private updateFallback() {
    const img = this.shadowRoot!.querySelector('img') as HTMLImageElement | null
    const nameEl = this.shadowRoot!.querySelector(
      '.brand-name',
    ) as HTMLElement | null

    if (img) {
      img.removeAttribute('src')
    }

    if (nameEl) {
      const screenName = getScreenName()
      if (screenName) {
        nameEl.textContent = screenName
      }
    }
  }

  private render() {
    const style = this.shadowRoot!.querySelector(
      'style',
    ) as HTMLStyleElement | null

    if (!style) {
      // First render
      this.shadowRoot!.innerHTML = `
        <style>${cssTemplate}</style>
        ${htmlTemplate}
      `
    }
  }

  // Public properties reflecting to attributes (primitive data)
  get showName(): boolean {
    return this._showName
  }

  set showName(value: boolean) {
    if (value) {
      this.setAttribute('show-name', '')
    } else {
      this.removeAttribute('show-name')
    }
  }

  get fallbackToName(): boolean {
    return this._fallbackToName
  }

  set fallbackToName(value: boolean) {
    this.setAttribute('fallback-to-name', value ? 'true' : 'false')
  }

  get maxWidth(): string {
    return this._maxWidth
  }

  set maxWidth(value: string) {
    if (!value) {
      this.removeAttribute('max-width')
    } else {
      this.setAttribute('max-width', value)
    }
  }

  get maxHeight(): string {
    return this._maxHeight
  }

  set maxHeight(value: string) {
    if (!value) {
      this.removeAttribute('max-height')
    } else {
      this.setAttribute('max-height', value)
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('brand-logo')) {
  customElements.define('brand-logo', BrandLogo)
}
