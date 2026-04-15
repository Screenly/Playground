import './css/style.css'
import '@screenly/edge-apps/components'
import { parseFeed } from '@rowanmanning/feed-parser'
import {
  formatLocalizedDate,
  getCorsProxyUrl,
  getLocale,
  getSettingWithDefault,
  getTimeZone,
  setupErrorHandling,
  setupTheme,
  signalReady,
} from '@screenly/edge-apps'

const MAX_ENTRIES = 6

interface RssEntry {
  title: string
  content: string
  formattedDate: string
}

interface AppCache {
  entries: RssEntry[]
  timestamp: number
}

const CACHE_KEY = 'rssStore'

function loadCache(): RssEntry[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return []
    const parsed: AppCache = JSON.parse(raw)
    return parsed.entries ?? []
  } catch {
    return []
  }
}

function saveCache(entries: RssEntry[]) {
  const data: AppCache = { entries, timestamp: Date.now() }
  localStorage.setItem(CACHE_KEY, JSON.stringify(data))
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatDate(date: Date, locale: string, timezone: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  } catch {
    return date.toISOString()
  }
}

async function fetchFeed(rssUrl: string): Promise<RssEntry[]> {
  const bypassCors =
    getSettingWithDefault<string>('bypass_cors', 'true') === 'true'
  const url = bypassCors ? `${getCorsProxyUrl()}/${rssUrl}` : rssUrl

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`)
  }
  const xml = await response.text()
  const feed = parseFeed(xml)

  const locale = await getLocale()
  const timezone = await getTimeZone()

  return feed.items.slice(0, MAX_ENTRIES).map((item) => {
    const rawContent = item.content ?? item.description ?? ''
    return {
      title: item.title ?? '',
      content: rawContent.includes('<') ? stripHtml(rawContent) : rawContent,
      formattedDate: item.published
        ? formatDate(item.published, locale, timezone)
        : '',
    }
  })
}

function renderCards(entries: RssEntry[]) {
  const grid = document.getElementById('feed-grid')!
  const template = document.getElementById(
    'feed-card-template',
  ) as HTMLTemplateElement

  grid.innerHTML = ''

  for (const entry of entries) {
    const clone = template.content.cloneNode(true) as DocumentFragment
    clone.querySelector<HTMLElement>('.feed-card-title')!.textContent =
      entry.title
    clone.querySelector<HTMLElement>('.feed-card-date')!.textContent =
      entry.formattedDate
    clone.querySelector<HTMLElement>('.feed-card-excerpt')!.textContent =
      entry.content
    grid.appendChild(clone)
  }
}

function showGrid() {
  document.getElementById('feed-grid')!.hidden = false
  document.getElementById('feed-error')!.hidden = true
}

function showError() {
  document.getElementById('feed-grid')!.hidden = true
  document.getElementById('feed-error')!.hidden = false
}

document.addEventListener('DOMContentLoaded', async () => {
  setupErrorHandling()
  setupTheme()

  const rssUrl = getSettingWithDefault<string>(
    'rss_url',
    'http://feeds.bbci.co.uk/news/rss.xml',
  )
  const cacheInterval =
    parseInt(getSettingWithDefault<string>('cache_interval', '1800')) * 1000

  const loadAndRender = async () => {
    try {
      const entries = await fetchFeed(rssUrl)
      renderCards(entries)
      saveCache(entries)
      showGrid()
    } catch (err) {
      console.error('RSS fetch failed:', err)
      const cached = loadCache()
      if (cached.length > 0) {
        renderCards(cached)
        showGrid()
      } else {
        showError()
      }
    }
  }

  const updateDate = () => {
    const dateEl = document.getElementById('feed-date')!
    dateEl.textContent = formatLocalizedDate(new Date(), locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone,
    })
  }

  const locale = await getLocale()
  const timezone = await getTimeZone()

  updateDate()
  setInterval(updateDate, 60000)

  await loadAndRender()
  signalReady()
  setInterval(loadAndRender, cacheInterval)
})
