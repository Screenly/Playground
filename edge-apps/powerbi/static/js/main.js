/* global screenly, panic */

(function () {
  const DEFAULT_TOKEN_REFRESH_SEC = 30 * 60;
  const TOKEN_STORAGE_KEY = 'powerbi_embed_token';
  const TOKEN_EXPIRY_STORAGE_KEY = 'powerbi_embed_token_expiry';
  const TOKEN_EXPIRY_BUFFER_SEC = 5 * 60; // Refresh 5 minutes before expiry
  const DEFAULT_APP_REFRESH_MIN = 30;
  const MIN_APP_REFRESH_MIN = 1;

  function getEmbedTypeFromUrl(url) {
    switch (true) {
      case url.indexOf('/dashboard') !== -1:
        return 'dashboard';
      default:
        return 'report';
    }
  }

  function clearStoredToken() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_STORAGE_KEY);
    } catch (error) {
      console.warn('Could not clear token from localStorage:', error);
    }
  }

  async function getEmbedToken() {
    // Use static token from settings if provided
    if (screenly.settings.embed_token) {
      return screenly.settings.embed_token;
    }

    // Check localStorage for cached token to avoid unnecessary API calls
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedExpiry = localStorage.getItem(TOKEN_EXPIRY_STORAGE_KEY);
      
      if (storedToken && storedExpiry) {
        const expiryTime = parseInt(storedExpiry, 10);
        const now = Date.now();
        const timeUntilExpiry = expiryTime - now;
        const bufferMs = TOKEN_EXPIRY_BUFFER_SEC * 1000;
        
        // Reuse token if it's still valid (more than 5 minutes until expiry)
        if (timeUntilExpiry > bufferMs) {
          return storedToken;
        }
        clearStoredToken();
      }
    } catch (error) {
      console.warn('Could not access localStorage for token cache:', error);
    }

    // Fetch new token from API
    try {
      var response = await fetch(screenly.settings.screenly_oauth_tokens_url + 'embed_token/', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch embed token: ${response.status} ${response.statusText}`);
      }

      const { token } = await response.json();
      
      if (!token) {
        throw new Error('No token received from API');
      }
      
      // Store token with 1 hour expiry (Power BI tokens expire after 1 hour)
      const actualExpiryTime = Date.now() + (60 * 60 * 1000);
      
      try {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(TOKEN_EXPIRY_STORAGE_KEY, actualExpiryTime.toString());
      } catch (storageError) {
        console.warn('Could not store token in localStorage:', storageError);
      }
      
      return token;
    } catch (error) {
      console.error('Error fetching embed token:', error);
      throw error;
    }
  }

  function initTokenRefreshLoop(report) {
    // Token refresh loop: proactively refreshes token to keep it valid
    var currentErrorStep = 0;
    var initErrorDelaySec = 15;
    var maxErrorStep = 7;

    // Use app_refresh_interval from settings to configure token refresh frequency
    var tokenRefreshIntervalSec = DEFAULT_TOKEN_REFRESH_SEC;
    if (screenly.settings.app_refresh_interval) {
      var intervalMinutes = parseInt(screenly.settings.app_refresh_interval, 10);
      if (!isNaN(intervalMinutes) && intervalMinutes >= MIN_APP_REFRESH_MIN) {
        tokenRefreshIntervalSec = intervalMinutes * 60;
      }
    }

    async function run() {
      var nextTimeout = tokenRefreshIntervalSec;
      try {
        var newToken = await getEmbedToken();
        await report.setAccessToken(newToken);
        currentErrorStep = 0;
      } catch (error) {
        console.error('Error refreshing token:', error);
        clearStoredToken();
        // Exponential backoff on errors
        nextTimeout = Math.min(initErrorDelaySec * Math.pow(2, currentErrorStep), tokenRefreshIntervalSec);
        if (currentErrorStep >= maxErrorStep) {
          console.error('Max token refresh errors reached, stopping token refresh loop');
          return;
        }
        currentErrorStep += 1;
      }
      setTimeout(run, nextTimeout * 1000);
    }

    setTimeout(run, tokenRefreshIntervalSec * 1000);
  }

  function initAppRefreshLoop(report) {
    // App refresh loop: refreshes report data at user-defined intervals
    // This is separate from token refresh - only refreshes data, not the token
    var refreshIntervalMin = DEFAULT_APP_REFRESH_MIN;
    if (screenly.settings.app_refresh_interval) {
      var parsed = parseInt(screenly.settings.app_refresh_interval, 10);
      if (!isNaN(parsed) && parsed >= MIN_APP_REFRESH_MIN) {
        refreshIntervalMin = parsed;
      } else if (!isNaN(parsed) && parsed > 0 && parsed < MIN_APP_REFRESH_MIN) {
        console.warn('App refresh interval must be at least 1 minute. Using minimum value of 1 minute.');
        refreshIntervalMin = MIN_APP_REFRESH_MIN;
      } else {
        console.warn('Invalid app refresh interval, using default of', DEFAULT_APP_REFRESH_MIN, 'minutes');
      }
    }
    
    var refreshIntervalSec = refreshIntervalMin * 60;

    function refreshApp() {
      try {
        report.refresh();
      } catch (error) {
        console.error('Error refreshing Power BI report:', error);
      }
      setTimeout(refreshApp, refreshIntervalSec * 1000);
    }

    setTimeout(refreshApp, refreshIntervalSec * 1000);
  }

  async function initializePowerBI() {
    const models = window['powerbi-client'].models;
    const embedUrl = screenly.settings.embed_url;
    const resourceType = getEmbedTypeFromUrl(embedUrl);

    const report = window.powerbi.embed(document.getElementById('embed-container'), {
      embedUrl: embedUrl,
      accessToken: await getEmbedToken(),
      type: resourceType,
      tokenType: models.TokenType.Embed,
      permissions: models.Permissions.All,
      settings: {
        filterPaneEnabled: false,
        navContentPaneEnabled: false,
      },
    });

    // Listen for Power BI errors to detect invalid tokens
    report.on('error', function(event) {
      if (event.detail) {
        var errorCode = event.detail.errorCode;
        var errorMessage = event.detail.message || '';
        
        // Detect token-related errors and clear cached token
        if (errorCode === 'TokenExpired' || 
            errorCode === 'InvalidToken' || 
            errorCode === 'Unauthorized' ||
            errorMessage.toLowerCase().indexOf('token') !== -1 ||
            errorMessage.toLowerCase().indexOf('unauthorized') !== -1 ||
            errorMessage.toLowerCase().indexOf('expired') !== -1) {
          console.warn('Power BI reported token error:', errorCode, errorMessage);
          clearStoredToken();
        }
      }
    });

    if (resourceType === 'report') {
      report.on('rendered', screenly.signalReadyForRendering);
    } else if (resourceType === 'dashboard') {
      report.on('loaded', () => {
        setTimeout(screenly.signalReadyForRendering, 1000);
      });
    }

    if (!screenly.settings.embed_token) {
      initTokenRefreshLoop(report);
    }

    initAppRefreshLoop(report);
    return report;
  }

  panic.configure({
    handleErrors: screenly.settings.display_errors == 'true' || false,
  });
  if (screenly.settings.display_errors == 'true') {
    window.addEventListener('error', screenly.signalReadyForRendering);
    window.addEventListener('unhandledrejection', screenly.signalReadyForRendering);
  }

  initializePowerBI();
})();
