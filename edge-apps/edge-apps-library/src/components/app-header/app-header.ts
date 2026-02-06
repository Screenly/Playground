import {
  formatTime,
  formatLocalizedDate,
  getTimeZone,
  getLocale,
} from '../../utils/index.js'

const htmlTemplate = `
<div class="header-left">
  <brand-logo show-name></brand-logo>
</div>
<div class="header-right">
  <span class="header-date"></span>
  <span class="header-time"></span>
  <slot name="actions"></slot>
</div>
`

const cssTemplate = `
:host {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: linear-gradient(93deg, rgba(0, 0, 0, 0.09) 2.78%, rgba(0, 0, 0, 0.01) 99.63%);
  backdrop-filter: blur(30px);
  padding: 8px 16px;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  width: 100%;
}

:host([hidden]) {
  display: none;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-time {
  font-size: 18px;
  font-weight: 300;
  opacity: 0.9;
  display: var(--show-time, block);
}

.header-date {
  font-size: 18px;
  opacity: 0.8;
  display: var(--show-date, none);
}

brand-logo {
  display: var(--show-logo, inline-flex);
}

@media (orientation: portrait) {
  .header-date {
    font-size: 24px;
  }
  
  .header-time {
    font-size: 24px;
  }
}
`

/**
 * AppHeader Web Component
 * A flexible header component with branding and time display
 *
 * Usage:
 * ```html
 * <app-header></app-header>
 * ```
 *
 * Attributes:
 * - `show-logo` (optional): Show brand logo (default: true)
 * - `show-time` (optional): Show time display (default: true)
 * - `show-date` (optional): Show date display (default: false)
 * - `time-format` (optional): Time format - "12h" or "24h" (default: auto-detect)
 */
export class AppHeader extends HTMLElement {
  private _showLogo: boolean = true
  private _showTime: boolean = true
  private _showDate: boolean = false
  private _timeFormat?: '12h' | '24h'
  private timezone: string = 'UTC'
  private locale: string = 'en'
  private updateInterval?: number

  static get observedAttributes() {
    return ['show-logo', 'show-time', 'show-date', 'time-format']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  async connectedCallback() {
    this.upgradeProperty('showLogo')
    this.upgradeProperty('showTime')
    this.upgradeProperty('showDate')
    this.upgradeProperty('timeFormat')

    this.loadAttributes()

    // Initialize timezone and locale
    try {
      this.timezone = await getTimeZone()
      this.locale = await getLocale()
    } catch (error) {
      console.warn('Failed to get timezone/locale:', error)
    }

    this.render()
    this.updateTime()

    // Update time every second
    if (this.showTime || this.showDate) {
      this.updateInterval = window.setInterval(() => {
        this.updateTime()
      }, 1000)
    }
  }

  disconnectedCallback() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
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
    this._showLogo = this.getAttribute('show-logo') !== 'false'
    this._showTime = this.getAttribute('show-time') !== 'false'
    this._showDate = this.hasAttribute('show-date')
    const format = this.getAttribute('time-format')
    if (format === '12h' || format === '24h') {
      this._timeFormat = format
    }
    this.updateCssProperties()
  }

  private updateCssProperties() {
    this.style.setProperty('--show-logo', this._showLogo ? 'block' : 'none')
    this.style.setProperty('--show-time', this._showTime ? 'block' : 'none')
    this.style.setProperty('--show-date', this._showDate ? 'block' : 'none')
  }

  private updateTime() {
    if (!this._showTime && !this._showDate) return

    const now = new Date()
    const timeEl = this.shadowRoot!.querySelector(
      '.header-time',
    ) as HTMLElement | null
    const dateEl = this.shadowRoot!.querySelector(
      '.header-date',
    ) as HTMLElement | null

    if (this._showTime && timeEl) {
      const timeData = formatTime(now, this.locale, this.timezone, {
        hour12:
          this._timeFormat === '12h' ||
          (this._timeFormat !== '24h' && undefined),
      })
      // Format time as "HH:MM" or "HH:MM AM/PM"
      const formattedTime = timeData.dayPeriod
        ? `${timeData.hour}:${timeData.minute} ${timeData.dayPeriod}`
        : `${timeData.hour}:${timeData.minute}`
      timeEl.textContent = formattedTime
      timeEl.style.display = 'block'
    } else if (timeEl) {
      timeEl.style.display = 'none'
    }

    if (this._showDate && dateEl) {
      const dateStr = formatLocalizedDate(now, this.locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: undefined,
      })
      dateEl.textContent = dateStr
      dateEl.style.display = 'block'
    } else if (dateEl) {
      dateEl.style.display = 'none'
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

      // Re-initialize time after render
      if (this._showTime || this._showDate) {
        setTimeout(() => this.updateTime(), 0)
      }
    }
  }

  // Public properties reflecting to attributes (primitive data)
  get showLogo(): boolean {
    return this._showLogo
  }

  set showLogo(value: boolean) {
    // Reflect to attribute; attributeChangedCallback handles side effects
    this.setAttribute('show-logo', value ? 'true' : 'false')
  }

  get showTime(): boolean {
    return this._showTime
  }

  set showTime(value: boolean) {
    this.setAttribute('show-time', value ? 'true' : 'false')
  }

  get showDate(): boolean {
    return this._showDate
  }

  set showDate(value: boolean) {
    if (value) {
      this.setAttribute('show-date', '')
    } else {
      this.removeAttribute('show-date')
    }
  }

  get timeFormat(): '12h' | '24h' | undefined {
    return this._timeFormat
  }

  set timeFormat(value: '12h' | '24h' | undefined) {
    if (value === '12h' || value === '24h') {
      this.setAttribute('time-format', value)
    } else {
      this.removeAttribute('time-format')
    }
  }
}

// Register the custom element
if (typeof window !== 'undefined' && !customElements.get('app-header')) {
  customElements.define('app-header', AppHeader)
}
