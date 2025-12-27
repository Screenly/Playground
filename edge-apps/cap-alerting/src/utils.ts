import { getCorsProxyUrl } from '@screenly/edge-apps'

export function getNearestExit(tags: string[]): string | undefined {
  for (const tag of tags) {
    const lower = tag.toLowerCase()
    if (lower.startsWith('exit:')) {
      return tag.slice(5).trim()
    }
    if (lower.startsWith('exit-')) {
      return tag.slice(5).trim()
    }
  }
  return undefined
}

export function splitIntoSentences(text: string): string[] {
  // Replace common abbreviations with placeholders to protect them from splitting
  let processed = text
  const abbreviations = [
    'Dr.',
    'Mr.',
    'Mrs.',
    'Ms.',
    'Prof.',
    'Sr.',
    'Jr.',
    'Inc.',
    'Ltd.',
    'Corp.',
    'Co.',
    'St.',
    'Ave.',
    'Blvd.',
    'etc.',
    'vs.',
    'e.g.',
    'i.e.',
    'U.S.',
    'U.K.',
  ]

  const placeholders = new Map<string, string>()
  abbreviations.forEach((abbr, index) => {
    const placeholder = `__ABBR_${index}__`
    placeholders.set(placeholder, abbr)
    processed = processed.replace(
      new RegExp(abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      placeholder,
    )
  })

  // Split sentences
  const sentences = processed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  // Restore abbreviations
  return sentences.map((s) => {
    let result = s
    placeholders.forEach((abbr, placeholder) => {
      result = result.replace(new RegExp(placeholder, 'g'), abbr)
    })
    return result
  })
}

export function proxyUrl(url: string): string {
  if (url && url.match(/^https?:/)) {
    const cors = getCorsProxyUrl()
    return `${cors}/${url}`
  }
  return url
}
