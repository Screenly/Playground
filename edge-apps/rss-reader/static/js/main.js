const processFeedContent = ({ content, contentSnippet }) => {
  // TODO: Process feed content to handle images and text accordingly.
  //   Add conditional statements to handle different types of content.
  return contentSnippet
}

class RssCache {
  constructor({ dbName, storeName }) {
    this.db = null
    this.dbName = dbName
    this.storeName = storeName

    this.openRequest = window.indexedDB.open(this.dbName, 1)

    this.openRequest.addEventListener('error', () => {
      console.log('Database failed to open')
    })

    this.openRequest.addEventListener('success', () => {
      console.log('Database opened successfully')

      this.db = this.openRequest.result
    });

    this.openRequest.addEventListener('upgradeneeded', (e) => {
      this.db = e.target.result

      const objectStore = this.db.createObjectStore(this.storeName, {
        keyPath: 'id',
        autoIncrement: true,
      });

      const fieldNames = ['title', 'pubDate', 'content', 'contentSnippet']

      fieldNames.forEach(fieldName => {
        objectStore.createIndex(fieldName, fieldName, { unique: false })
      })

      console.log('Database setup complete')
    });
  }

  addData({ title, pubDate, content, contentSnippet }) {
    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const objectStore = transaction.objectStore(this.storeName)
    const addRequest = objectStore.add({
      title,
      pubDate,
      content,
      contentSnippet
    })

    addRequest.addEventListener('success', () => {
      console.log('Data added successfully')
    })

    transaction.addEventListener('complete', () => {
      console.log('Transaction completed: database modification finished.')
    })

    transaction.addEventListener('error', () => {
      console.log('Transaction not opened due to error')
    })
  }

  updateData(callback) {
    const objectStore = this.db
      .transaction(this.storeName)
      .objectStore(this.storeName)
    const request = objectStore.getAll()

    request.addEventListener('success', () => {
      callback(request.result)
    })
  }

  clearData() {
    const objectStore = this.db
      .transaction(this.storeName, 'readwrite')
      .objectStore(this.storeName)
    objectStore.clear()
  }
}

const initApp = () => {
  const feedsContainer = document
    .querySelector('#feeds-container')
    .querySelector('.row')
  const { rss_url, rss_title, limit } = screenly.settings
  const parser = new RSSParser()

  const titleHeader = document.querySelector('#rss-title')
  titleHeader.innerHTML = rss_title
  document.title = rss_title

  const rssCache = new RssCache({ dbName: 'rssCache', storeName: 'rssStore' })

  rssCache.openRequest.addEventListener('success', () => {
    setInterval((() => {
      const lambda = () => {
        parser.parseURL(rss_url, (err, feed) => {
          if (err) {
            throw err
          }

          const entries = feed.items.slice(0, limit)

          rssCache.clearData()
          entries.forEach(entry => {
            rssCache.addData({
              title: entry.title,
              pubDate: entry.pubDate,
              content: entry.content,
              contentSnippet: entry.contentSnippet,
            })
          })
        })
      }

      lambda()

      return lambda
    })(), screenly.settings.cache_interval * 1000)

    setInterval((() => {
      const lambda = () => {
        while (feedsContainer.firstChild) {
          feedsContainer.removeChild(feedsContainer.firstChild)
        }

        rssCache.updateData(entries => {
          entries.forEach(entry => {
            const title = entry.title
            const date = moment(new Date(entry.pubDate))
              .format('MMMM DD, YYYY, h:mm A')

            const feedTemplate = document.querySelector('#feed-template')
            const feedContainer = feedTemplate.content.cloneNode(true)

            feedContainer.querySelector('.feed-title').innerHTML = title
            feedContainer.querySelector('.feed-date').innerHTML = date
            feedDescription = feedContainer
              .querySelector('.feed-description')
              .querySelector('p')
            feedDescription.innerHTML = processFeedContent(entry)

            feedsContainer.appendChild(feedContainer)
          })
        })
      }

      lambda()

      return lambda
    })(), screenly.settings.cache_interval * 1000)
  })
}

initApp()
