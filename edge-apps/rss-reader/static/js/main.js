const initApp = () => {
  const feedsContainer = document.querySelector('#feeds-container')
  const { rss_url, rss_title, limit } = screenly.settings
  const parser = new RSSParser()

  const titleHeader = document.querySelector('#rss-title')
  document.title = rss_title
  titleHeader.innerHTML = rss_title

  parser.parseURL(rss_url, (err, feed) => {
    if (err) {
      throw err
    }

    const entries = feed.items.slice(0, limit)

    entries.forEach(entry => {
      const title = entry.title
      const link = entry.link
      const date = new Date(entry.pubDate)
      // @TODO: Some feeds don't have a `contentSnippet` property.
      //        We should handle situations where the description is not available
      //        or uses a different property name. Alternatively, we could
      //        specify the name of the property in the settings.
      const description = entry.contentSnippet

      const feedTemplate = document.querySelector('#feed-template')
      const feedContainer = feedTemplate.content.cloneNode(true)
      feedContainer.querySelector('.feed-title').innerHTML = title
      feedContainer.querySelector('.feed-date').innerHTML = date

      feedLink = feedContainer.querySelector('.feed-link')
      feedLink.innerHTML = link
      feedLink.href = link
      feedLink.target = '_blank'

      feedDescription = feedContainer.querySelector('.feed-description')
      feedDescription.innerHTML = description

      feedsContainer.appendChild(feedContainer)
    })
  })
}

initApp()
