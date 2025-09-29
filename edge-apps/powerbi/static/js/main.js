(function () {
  const OAUTH_TOKENS_URL = 'https://api.screenlyapp.com/api/v3/edge-apps/oauth/tokens';
  const DEFAULT_TOKEN_REFRESH_SEC = 30 * 60; // refresh token every 30 minutes

  function getEmbedTypeFromUrl(url) {
    switch (true) {
      case url.indexOf('/dashboard') !== -1:
        return 'dashboard';
      default:
        return 'report';
    }
  }

  async function getEmbedToken() {
    if (screenly.settings.embed_token) {
      return screenly.settings.embed_token;
    }

    var response = await fetch(`${OAUTH_TOKENS_URL}/embed_token/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
      },
    });

    const { token } = await response.json();
    return token;
  }

  function initTokenRefreshLoop(report) {
    var currentErrorStep = 0;
    var initErrorDelaySec = 15;
    var maxErrorStep = 7;

    async function run() {
      var nextTimeout = DEFAULT_TOKEN_REFRESH_SEC;
      try {
        var newToken = await getEmbedToken();
        await report.setAccessToken(newToken);
        currentErrorStep = 0;
      } catch {
        nextTimeout = Math.min(initErrorDelaySec * Math.pow(2, currentErrorStep), nextTimeout);
        if (currentErrorStep >= maxErrorStep) {
          return;
        }
        currentErrorStep += 1;
      }
      setTimeout(run, nextTimeout * 1000);
    }

    setTimeout(run, DEFAULT_TOKEN_REFRESH_SEC * 1000);
  }

  async function initializePowerBI() {
    const models = window['powerbi-client'].models;
    const embedUrl = screenly.settings.embed_url;

    const report = window.powerbi.embed(document.getElementById('embed-container'), {
      embedUrl: embedUrl,
      accessToken: await getEmbedToken(),
      type: getEmbedTypeFromUrl(embedUrl),
      tokenType: models.TokenType.Embed,
      permissions: models.Permissions.All,
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: false,
      },
    });

    report.on('rendered', screenly.signalReadyForRendering);

    if (!screenly.settings.embed_token) {
      initTokenRefreshLoop(report);
    }
  }

  panic.configure({ handleErrors: screenly.settings.display_errors == 'true' || false });
  if (screenly.settings.display_errors == 'true') {
    window.addEventListener('error', screenly.signalReadyForRendering);
    window.addEventListener('unhandledrejection', screenly.signalReadyForRendering);
  }

  initializePowerBI();
})();
