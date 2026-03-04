import type { ScreenType } from './state'

export const SCREEN_DATA_PREPARED = 'screen-data-prepared'

export interface ScreenDataPreparedDetail {
  role: ScreenType
}

export function dispatchScreenDataPrepared(role: ScreenType): void {
  window.dispatchEvent(
    new CustomEvent<ScreenDataPreparedDetail>(SCREEN_DATA_PREPARED, {
      detail: { role },
    }),
  )
}

export function waitForScreenDataPrepared(role: ScreenType): Promise<void> {
  return new Promise((resolve) => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ScreenDataPreparedDetail>).detail
      if (detail.role === role) {
        window.removeEventListener(SCREEN_DATA_PREPARED, handler)
        resolve()
      }
    }
    window.addEventListener(SCREEN_DATA_PREPARED, handler)
  })
}
