const CACHE_KEY = 'rssStore'

export interface RssEntry {
  title: string
  content: string
  formattedDate: string
}

interface AppCache {
  entries: RssEntry[]
  timestamp: number
}

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function loadCache(): RssEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return []
    const parsed: AppCache = JSON.parse(raw)
    return parsed.entries ?? []
  } catch {
    return []
  }
}

export function saveCache(entries: RssEntry[]) {
  const data: AppCache = { entries, timestamp: Date.now() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}
