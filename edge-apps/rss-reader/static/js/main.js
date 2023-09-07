class AppCache {
  constructor({ storeName }) {
    this.storeName = storeName;

    if (localStorage.getItem(this.storeName) === null) {
      this.data = [];
      localStorage.setItem(this.storeName, JSON.stringify(this.data));
    } else {
      this.data = JSON.parse(localStorage.getItem(this.storeName));
      console.log('Database setup complete');
    }
  }

  clear() {
    this.data = [];
    localStorage.removeItem(this.storeName);
  }

  add(data) {
    this.data.push(data);
    localStorage.setItem(this.storeName, JSON.stringify(this.data));
  }

  getAll() {
    return this.data;
  }
}

const processUrl = (context) => {
  const corsProxy = context.corsProxy;
  const { bypassCors, rssUrl } = context.settings;

  if (bypassCors) {
    return `${corsProxy}/${rssUrl}`;
  } else {
    return rssUrl;
  }
};

const getApiResponse = (context) => {
  return new Promise((resolve, reject) => {
    let parser = new RSSParser();
    const url = processUrl(context);
    parser.parseURL(url, (err, feed) => {
      if (err) {
        reject(err);
      }

      resolve(feed.items);
    });
  });
};

const getRssData = function() {
  return {
    entries: [],
    settings: {
      cacheInterval: 1800,
      limit: 4,
      rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
      rssTitle: 'BBC News',
    },
    loadSettings: function() {
      if (typeof screenly === 'undefined') {
        console.warn('screenly is not defined. Using default settings.');
        return;
      }

      const settings = screenly.settings;

      this.settings.bypassCors = (settings?.bypass_cors === 'true');
      this.settings.cacheInterval = parseInt(settings?.cache_interval)
        || this.settings.cacheInterval;
      this.settings.limit = parseInt(settings?.limit)
        || this.settings.limit;
      this.settings.rssUrl = settings?.rss_url || this.settings.rssUrl;
      this.settings.rssTitle = settings?.rss_title || this.settings.rssTitle;
      this.corsProxy = screenly.cors_proxy_url;

      console.log(`CORS Proxy URL: ${this.corsProxy}`);
    },
    init: async function() {
      this.loadSettings();
      const msPerSecond = 1000;
      const appCache = new AppCache({
        storeName: 'rssStore',
      });

      setInterval(await (async () => {
        const lambda = async () => {
          try {
            const response = (await getApiResponse(this)).slice(0, this.settings.limit);
            appCache.clear();
            const entries = response.map(
              ({title, pubDate, content, contentSnippet}) => {
                return { title, pubDate, content, contentSnippet };
              }
            );

            this.entries = entries;

            entries.forEach(async (entry) => {
              appCache.add(entry);
            });
          } catch (err) {
            console.error(err);
            const entries = appCache.getAll();
            this.entries = entries;
          }
        };

        lambda();

        return lambda;
      })(), this.settings.cacheInterval * msPerSecond);
    },
  };
};

document.addEventListener('alpine:init', () => {
  Alpine.data('rss', getRssData);
});
