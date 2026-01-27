/* global screenly, panic */

;(function () {
  const DEFAULT_TOKEN_REFRESH_SEC = 30 * 60 // refresh token every 30 minutes

  function showError(error) {
    const container = document.getElementById('embed-container')
    container.innerHTML = ''

    const template = document.getElementById('error-template')
    const content = template.content.cloneNode(true)

    const messageEl = content.querySelector('.error-message')
    if (error.detailedMessage) {
      messageEl.textContent = error.detailedMessage
    }

    const table = content.querySelector('.error-details')
    const rowTemplate = document.getElementById('error-row-template')
    const errorInfo = error.technicalDetails && error.technicalDetails.errorInfo

    if (errorInfo) {
      errorInfo.forEach(function (item) {
        const row = rowTemplate.content.cloneNode(true)
        row.querySelector('.error-key').textContent = item.key
        row.querySelector('.error-value').textContent = item.value
        table.appendChild(row)
      })
    }

    container.appendChild(content)
  }

  function getEmbedTypeFromUrl(url) {
    switch (true) {
      case url.indexOf('/dashboard') !== -1:
        return 'dashboard'
      default:
        return 'report'
    }
  }

  async function getEmbedToken() {
    if (screenly.settings.embed_token) {
      return screenly.settings.embed_token
    }

    var response = await fetch(
      screenly.settings.screenly_oauth_tokens_url + 'embed_token/',
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
        },
      },
    )

    if (!response.ok) {
      let detailedMessage
      try {
        detailedMessage = (await response.json())['error']
      } catch {
        detailedMessage = `Failed to get embed token.`
      }

      showError({
        detailedMessage: detailedMessage,
        technicalDetails: {
          errorInfo: [
            {
              key: 'status',
              value: response.status,
            },
          ],
        },
      })

      throw new Error(detailedMessage)
    }

    const { token } = await response.json()
    return token
  }

  function initTokenRefreshLoop(report) {
    var currentErrorStep = 0
    var initErrorDelaySec = 15
    var maxErrorStep = 7

    async function run() {
      var nextTimeout = DEFAULT_TOKEN_REFRESH_SEC
      try {
        var newToken = await getEmbedToken()
        await report.setAccessToken(newToken)
        currentErrorStep = 0
      } catch {
        nextTimeout = Math.min(
          initErrorDelaySec * Math.pow(2, currentErrorStep),
          nextTimeout,
        )
        if (currentErrorStep >= maxErrorStep) {
          return
        }
        currentErrorStep += 1
      }
      setTimeout(run, nextTimeout * 1000)
    }

    setTimeout(run, DEFAULT_TOKEN_REFRESH_SEC * 1000)
  }

  async function initializePowerBI() {
    const models = window['powerbi-client'].models
    const embedUrl = screenly.settings.embed_url
    const resourceType = getEmbedTypeFromUrl(embedUrl)

    const report = window.powerbi.embed(
      document.getElementById('embed-container'),
      {
        embedUrl: embedUrl,
        accessToken: await getEmbedToken(),
        type: resourceType,
        tokenType: models.TokenType.Embed,
        permissions: models.Permissions.All,
        settings: {
          filterPaneEnabled: false,
          navContentPaneEnabled: false,
          hideErrors: true,
        },
      },
    )

    if (resourceType === 'report') {
      report.on('rendered', screenly.signalReadyForRendering)
    } else if (resourceType === 'dashboard') {
      report.on('loaded', () => {
        setTimeout(screenly.signalReadyForRendering, 1000)
      })
    }

    report.on('error', function (event) {
      showError(event.detail)
      screenly.signalReadyForRendering()
    })

    if (!screenly.settings.embed_token) {
      initTokenRefreshLoop(report)
    }
  }

  panic.configure({
    handleErrors: screenly.settings.display_errors == 'true' || false,
  })
  if (screenly.settings.display_errors == 'true') {
    window.addEventListener('error', screenly.signalReadyForRendering)
    window.addEventListener(
      'unhandledrejection',
      screenly.signalReadyForRendering,
    )
  }

  initializePowerBI()
})()
