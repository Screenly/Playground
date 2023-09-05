class AppCache {
  constructor({ dbName, storeName, fieldNames }) {
    this.version = 1;
    this.dbName = dbName;
    this.storeName = storeName;
    this.db = null;
    this.fieldNames = [...fieldNames];
  }

  async openDatabase() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);

      request.addEventListener('error', (err) => {
        console.error('Database failed to open');
        reject(err);
      });

      request.addEventListener('success', (event) => {
        console.log('Database opened successfully');
        this.db = event.target.result;
        resolve();
      });

      request.addEventListener('upgradeneeded', (event) => {
        this.db = event.target.result;
        const objectStore = this.db.createObjectStore(this.storeName, {
          keyPath: 'id',
          autoIncrement: true,
        });

        this.fieldNames.forEach((fieldName) => {
          objectStore.createIndex(fieldName, fieldName, { unique: false });
        });

        console.log('Database setup complete');
      });
    });
  }

  async addData(data) {
    const hasAllRequiredFields = this.fieldNames.every((field) => {
      return Object.keys(data).includes(field);
    });

    if (!hasAllRequiredFields) {
      throw new Error('Data does not have all required fields');
    }

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.add(data);

    return new Promise((resolve, reject) => {
      request.addEventListener('success', (event) => {
        console.log('Data added successfully');
        resolve();
      });

      request.addEventListener('error', (err) => {
        reject(err);
      });
    });
  }

  async getData() {
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.addEventListener('success', (event) => {
        resolve(event.target.result);
      });

      request.addEventListener('error', (err) => {
        reject(err);
      });
    });
  }

  async clearData() {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.addEventListener('success', (event) => {
        resolve();
      });

      request.addEventListener('error', (err) => {
        reject(err);
      });
    });
  }
}

const processUrl = (context) => {
  const corsProxy = context.corsProxy;
  const { bypassCors, rssUrl } = context.settings;

  if (!bypassCors) {
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
      limit: 4,
      cacheInterval: 1800,
      rssUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
      rssTitle: 'RSS Feed',
    },
    corsProxy: 'http://127.0.0.1:3030',
    loadSettings: function() {
      if (typeof screenly === 'undefined') {
        console.warn('screenly is not defined. Using default settings.');
        return;
      }

      const settings = screenly.settings;

      this.settings.cacheInterval = parseInt(settings?.cache_interval)
        || this.settings.cacheInterval;
      this.settings.bypassCors = (settings?.bypass_cors === 'true');
      this.settings.limit = parseInt(settings?.limit)
        || this.settings.limit;
      this.settings.rssUrl = settings?.rss_url || this.settings.rssUrl;
      this.settings.rssTitle = settings?.rss_title || this.settings.rssTitle;
      this.corsProxy = screenly.cors_proxy || this.corsProxy;
    },
    init: async function() {
      this.loadSettings();
      const msPerSecond = 1000;
      const appCache = new AppCache({
        dbName: 'rssCache',
        storeName: 'rssStore',
        fieldNames: ['title', 'pubDate', 'content', 'contentSnippet'],
      });

      try {
        await appCache.openDatabase();
      } catch (err) {
        console.error(err);
        return;
      }

      setInterval(await (async () => {
        const lambda = async () => {
          try {
            const response = (await getApiResponse(this)).slice(0, this.settings.limit);
            await appCache.clearData();
            const entries = response.map(
              ({title, pubDate, content, contentSnippet}) => {
                return { title, pubDate, content, contentSnippet };
              }
            );

            this.entries = entries;

            entries.forEach(async (entry) => {
              await appCache.addData(entry);
            });
          } catch (err) {
            console.error(err);
            const entries = await appCache.getData();
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
