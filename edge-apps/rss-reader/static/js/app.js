/* global Alpine, RSSParser, screenly */

class AppCache {
  constructor({ keyName }) {
    this.keyName = keyName

    if (localStorage.getItem(this.keyName) === null) {
      this.data = []
      localStorage.setItem(this.keyName, JSON.stringify(this.data))
    } else {
      this.data = JSON.parse(localStorage.getItem(this.keyName))
      console.log('Database setup complete')
    }
  }

  clear() {
    this.data = []
    localStorage.removeItem(this.keyName)
  }

  add(data) {
    this.data.push(data)
    localStorage.setItem(this.keyName, JSON.stringify(this.data))
  }

  getAll() {
    return this.data
  }
}

const processUrl = (context) => {
  const corsProxy = context.corsProxy
  const { bypassCors, rssUrl } = context.settings

  if (bypassCors) {
    return `${corsProxy}/${rssUrl}`
  } else {
    return rssUrl
  }
}

const getApiResponse = (context) => {
  return new Promise((resolve, reject) => {
    const parser = new RSSParser()
    const url = processUrl(context)
    parser.parseURL(url, (err, feed) => {
      if (err) {
        reject(err)
      }

      resolve(feed.items)
    })
  })
}

const getRssData = function () {
  return {
    entries: [],
    settings: {
      cacheInterval: 1800,
      limit: 2,
      rssUrl: 'https://api.codetabs.com/v1/proxy/?quest=http://feeds.bbci.co.uk/news/rss.xml',
      rssTitle: 'BBC News'
    },
    isLoading: true,
    fetchError: false,
    loadSettings: function () {
      if (typeof screenly === 'undefined') {
        console.warn('screenly is not defined. Using default settings.')
        return
      }

      const settings = screenly.settings

      this.settings.bypassCors = (settings?.bypass_cors === 'true')
      this.settings.cacheInterval = parseInt(settings?.cache_interval) ||
        this.settings.cacheInterval
      this.settings.limit = parseInt(settings?.limit) ||
        this.settings.limit
      this.settings.rssUrl = settings?.rss_url || this.settings.rssUrl
      this.settings.rssTitle = settings?.rss_title || this.settings.rssTitle
      this.corsProxy = screenly.cors_proxy_url

      console.log(`CORS Proxy URL: ${this.corsProxy}`)
    },
    init: async function () {
      this.loadSettings()
      const msPerSecond = 1000
      const appCache = new AppCache({
        keyName: 'rssStore'
      })

      setInterval(await (async () => {
        const lambda = async () => {
          try {
            const response = (await getApiResponse(this)).slice(0, this.settings.limit)
            console.log(response)
            this.fetchError = false
            appCache.clear()
            const entries = response.map(
              ({ title, pubDate, content, contentSnippet }) => {
                return { title, pubDate, content, contentSnippet }
              }
            )

            this.entries = entries

            entries.forEach(async (entry) => {
              appCache.add(entry)
            })

            this.isLoading = false
          } catch (err) {
            console.error(err)
            const entries = appCache.getAll()
            if (entries.length === 0) {
              this.fetchError = true
            } else {
              this.fetchError = false
              this.entries = entries
              this.isLoading = false
            }
          }
        }

        lambda()

        return lambda
      })(), this.settings.cacheInterval * msPerSecond)
    }
  }
}

document.addEventListener('alpine:init', () => {
  Alpine.data('rss', getRssData)
})
