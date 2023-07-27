// @TODO: Process feed content to handle images and text accordingly.
//   Add conditional statements to handle different types of content.
const processFeedContent = ({ content, contentSnippet }) => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')

  return contentSnippet
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

  parser.parseURL(rss_url, (err, feed) => {
    if (err) {
      throw err
    }

    const entries = feed.items.slice(0, limit)

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

initApp()
