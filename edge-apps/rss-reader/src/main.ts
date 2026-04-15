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
  signalReady,
} from '@screenly/edge-apps'
import { loadCache, saveCache, stripHtml, type RssEntry } from './utils'

const MAX_ENTRIES = 6

async function fetchFeed(
  rssUrl: string,
  locale: string,
  timezone: string,
  source: string,
): Promise<RssEntry[]> {
  const bypassCors =
    getSettingWithDefault<string>('bypass_cors', 'true') === 'true'
  const url = bypassCors ? `${getCorsProxyUrl()}/${rssUrl}` : rssUrl

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status}`)
  }
  const xml = await response.text()
  const feed = parseFeed(xml)

  return feed.items.slice(0, MAX_ENTRIES).map((item) => {
    const rawContent = item.content ?? item.description ?? ''
    return {
      title: item.title ?? '',
      source,
      content: rawContent.includes('<') ? stripHtml(rawContent) : rawContent,
      formattedDate: item.published
        ? formatLocalizedDate(item.published, locale, {
            timeZone: timezone,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })
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
    clone.querySelector<HTMLElement>('.feed-card-source')!.textContent =
      entry.source
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

  const rssUrl = getSettingWithDefault<string>(
    'rss_url',
    'http://feeds.bbci.co.uk/news/rss.xml',
  )
  const rssTitle = getSettingWithDefault<string>('rss_title', 'RSS Feed')
  const cacheInterval =
    parseInt(getSettingWithDefault<string>('cache_interval', '1800')) * 1000

  const loadAndRender = async () => {
    try {
      const entries = await fetchFeed(rssUrl, locale, timezone, rssTitle)
      saveCache(entries)
      renderCards(entries)
      showGrid()
    } catch (err) {
      console.error('RSS fetch failed:', err)
      const cached = loadCache()
      if (cached.length === 0) {
        showError()
        return
      }
      renderCards(cached)
      showGrid()
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
