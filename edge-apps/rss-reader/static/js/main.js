const processFeedContent = (
  feedDescription, { content, contentSnippet }, includeImage) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  const image = doc.querySelector('img')

  const text = document.createElement('p')
  text.innerHTML = contentSnippet
  const span = document.createElement('span')
  span.appendChild(text)

  // @TODO: Uncomment this if-statement if you want to include the image.
  // if (image && includeImage) {
  //   const imageUrl = image.getAttribute('src')
  //   const imageElement = document.createElement('img')
  //   imageElement.setAttribute('src', imageUrl)
  //   imageElement.classList.add('feed-image')
  //   imageElement.setAttribute('alt', 'feed-image')

  //   span.appendChild(imageElement)
  // }

  feedDescription.innerHTML = span.innerHTML
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
    .querySelector('#grid')
  let { rss_url: rssUrl, rss_title, limit } = screenly.settings
  const parser = new RSSParser()
  const bypassCors = screenly.settings.bypass_cors

  if (bypassCors != "true") {
    rssUrl = screenly.cors_proxy + rssUrl
  }

  const titleHeader = document.querySelector('#rss-title')
  titleHeader.innerHTML = rss_title
  document.title = rss_title

  const rssCache = new RssCache({ dbName: 'rssCache', storeName: 'rssStore' })

  rssCache.openRequest.addEventListener('success', () => {
    setInterval((() => {
      const lambda = () => {
        parser.parseURL(rssUrl, (err, feed) => {
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
          entries.forEach((entry, index) => {
            const title = entry.title
            const date = moment(new Date(entry.pubDate))
              .format('MMMM DD, YYYY, h:mm A')
            const feedTemplate = document.querySelector('#feed-template')
            const feedContainer = feedTemplate.content.cloneNode(true)

            feedContainer.querySelector('.feed-title').innerHTML = title
            feedContainer.querySelector('.feed-date').innerHTML = date

            const feedDescription = feedContainer
              .querySelector('.feed-description')
            processFeedContent(feedDescription, entry, (index === 0))

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
