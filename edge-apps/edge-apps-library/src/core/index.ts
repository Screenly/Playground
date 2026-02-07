import type { AutoScalerElement } from '../components/auto-scaler/auto-scaler.js'
import type { EdgeAppDevToolsElement } from '../components/dev-tools/dev-tools.js'

// Side-effect: Ensure components are registered when initEdgeApp is used
import '../components/register.js'

/**
 * Initialize an edge app with auto-scaling
 * Convenience function for quick setup using web components
 *
 * @example
 * ```typescript
 * const { scaler, devTools } = initEdgeApp('app', {
 *   referenceWidth: 1920,
 *   referenceHeight: 1080,
 *   enableDevTools: true,
 * })
 * ```
 */
export function initEdgeApp(
  containerId: string,
  options: {
    referenceWidth: number
    referenceHeight: number
    orientation?: 'landscape' | 'portrait' | 'auto'
    centerContent?: boolean
    padding?: string
    debounceMs?: number
    enableDevTools?: boolean
    safeZone?: unknown // Deprecated: kept for backwards compatibility but ignored
  },
): { scaler: AutoScalerElement; devTools?: EdgeAppDevToolsElement } {
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`Container element with id "${containerId}" not found`)
  }

  // Ensure components are registered (they auto-register when imported)
  // Components are registered via side-effect imports in components/register.ts
  // This is handled when user imports '@screenly/edge-apps/components'

  // Create <auto-scaler> element
  const scalerEl = document.createElement('auto-scaler') as AutoScalerElement
  scalerEl.setAttribute('reference-width', String(options.referenceWidth))
  scalerEl.setAttribute('reference-height', String(options.referenceHeight))

  if (options.orientation) {
    scalerEl.setAttribute('orientation', options.orientation)
  }

  if (options.centerContent !== undefined) {
    if (options.centerContent) {
      scalerEl.setAttribute('center-content', '')
    } else {
      scalerEl.removeAttribute('center-content')
    }
  }

  if (options.padding) {
    scalerEl.setAttribute('padding', options.padding)
  }

  if (options.debounceMs) {
    scalerEl.setAttribute('debounce-ms', String(options.debounceMs))
  }

  // Move container content into scaler element
  // Store original children
  const children = Array.from(container.childNodes)

  // Move children into scaler first
  children.forEach((child) => {
    scalerEl.appendChild(child)
  })

  // Replace container children with scaler
  container.replaceChildren(scalerEl)

  // Create dev tools if enabled
  let devToolsEl: EdgeAppDevToolsElement | undefined

  if (options.enableDevTools) {
    devToolsEl = document.createElement(
      'edge-app-devtools',
    ) as EdgeAppDevToolsElement
    devToolsEl.setAttribute('reference-width', String(options.referenceWidth))
    devToolsEl.setAttribute('reference-height', String(options.referenceHeight))

    // Listen for scalechange events from scaler
    scalerEl.addEventListener('scalechange', ((
      event: CustomEvent<{ scale: number }>,
    ) => {
      if (devToolsEl && event.detail?.scale) {
        devToolsEl.updateScale(event.detail.scale)
      }
    }) as EventListener)

    // Append to body (dev tools should be at root level)
    document.body.appendChild(devToolsEl)

    // Update dev tools with initial scale after scaler is connected
    // Use a small delay to ensure scaler has calculated initial scale
    setTimeout(() => {
      if (devToolsEl && scalerEl.scale) {
        devToolsEl.updateScale(scalerEl.scale)
      }
    }, 0)
  }

  return { scaler: scalerEl, devTools: devToolsEl }
}
