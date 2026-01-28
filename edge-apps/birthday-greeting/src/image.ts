export function isValidBase64Image(str: string): boolean {
  if (!str || str.trim() === '') {
    return false
  }

  const base64Pattern = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml);base64,/
  if (base64Pattern.test(str)) {
    return true
  }

  // Remove whitespace for validation
  const cleaned = str.replace(/\s/g, '')

  // Must contain only valid base64 characters
  const pureBase64Pattern = /^[A-Za-z0-9+/=]+$/
  if (!pureBase64Pattern.test(cleaned)) {
    return false
  }

  // Must be at least 4 characters (minimum valid base64)
  // and length should be multiple of 4 (with padding) for valid base64
  return cleaned.length >= 4 && cleaned.length % 4 === 0
}

export function formatBase64Image(str: string): string {
  if (str.startsWith('data:image/')) {
    return str
  }
  return `data:image/jpeg;base64,${str}`
}
