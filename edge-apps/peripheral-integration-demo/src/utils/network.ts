export function getNetworkStatus(): 'Connected' | 'Offline' {
  return navigator.onLine ? 'Connected' : 'Offline'
}
