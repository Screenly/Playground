const initApp = () => {
  const feedsContainer = document.querySelector('#feeds-container')
  const source = screenly.settings.rss_url
  const parser = new RSSParser()

  parser.parseURL(source, (err, feed) => {
    if (err) {
      throw err
    }

    feed.items.forEach(entry => {
      title = entry.title
      link = entry.link,
      date = new Date(entry.pubDate)

      const feedTemplate = document.querySelector('#feed-template')
      const feedContainer = feedTemplate.content.cloneNode(true)
      feedContainer.querySelector('.feed-title').innerHTML = title
      feedContainer.querySelector('.feed-date').innerHTML = date

      feedLink = feedContainer.querySelector('.feed-link')
      feedLink.innerHTML = link
      feedLink.href = link
      feedLink.target = '_blank'

      feedsContainer.appendChild(feedContainer)
    })
  })
}

initApp()
