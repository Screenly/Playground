(function () {
  function displayPosts (posts) {
    const container = document.querySelector('.cards')
    const placeholder = document.querySelector('.dummy-card')
    const fragment = document.createDocumentFragment()

    posts.forEach(({ username, caption, media_url }) => {
      const node = placeholder.cloneNode(true)
      const imgNode = node.querySelector('.post-image')
      const captionNode = node.querySelector('.caption')

      imgNode.setAttribute('src', media_url)
      captionNode.innerHTML = `<span class="user-handle">@${username}</span> ${caption || ''}`
      node.classList.remove('dummy-card')
      fragment.appendChild(node)
    })

    container.appendChild(fragment)
  }

  function fetchPosts () {
    var token = "YOUR_TOKEN_HERE"
    const url = `https://graph.instagram.com/me/media?fields=username,caption,media_url,media_type&access_token=${token}`
    fetch(url)
      .then(response => response.json())
      .then((data) => {
        const { data: posts } = data;
        const latestTwoPosts = [];
        for (index = 0; index < posts.length; index++) {
          if (posts[index].media_type === 'IMAGE') {
            latestTwoPosts.push(posts[index])
          }

          if (latestTwoPosts.length === 2) {
            break;
          }
        }
        displayPosts(latestTwoPosts)
      })
      .catch((e) => {
        console.log(e)
      });
  }

  fetchPosts()
}) ()