import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  mock,
  spyOn,
} from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()

const NOW_MS = 1_700_000_000_000
const OAUTH_SETTINGS = {
  screenly_oauth_tokens_url: 'https://api.example.com/oauth/',
  screenly_app_auth_token: 'app-auth',
}
const REPORT_EMBED_URL =
  'https://app.powerbi.com/reportEmbed?reportId=r&groupId=g'

function setupDom() {
  document.body.innerHTML = `
    <div id="embed-container"></div>
    <template id="error-template">
      <div class="error-container">
        <p class="error-message"></p>
        <table class="error-details"></table>
      </div>
    </template>
    <template id="error-row-template"></template>
  `

  const rowTemplate = document.getElementById(
    'error-row-template',
  ) as HTMLTemplateElement
  const row = document.createElement('tr')
  for (const className of ['error-key', 'error-value']) {
    const cell = document.createElement('td')
    cell.className = className
    row.appendChild(cell)
  }
  rowTemplate.content.appendChild(row)
}

const embedCalls: Array<{ config: Record<string, unknown> }> = []
const reportOn = mock(() => {})
const reportSetAccessToken = mock(async () => {})
const reportReload = mock(async () => {})
const fakeReport = {
  on: reportOn,
  setAccessToken: reportSetAccessToken,
  reload: reportReload,
}

class FakeService {
  embed(_container: unknown, config: Record<string, unknown>) {
    embedCalls.push({ config })
    return fakeReport
  }
}

mock.module('powerbi-client', () => ({
  service: { Service: FakeService },
  factories: { hpmFactory: {}, wpmpFactory: {}, routerFactory: {} },
  models: { TokenType: { Embed: 'Embed' }, Permissions: { All: 'All' } },
}))

const reportError = mock(() => {})
mock.module('@screenly/edge-apps/utils', () => ({
  setupSentry: () => {},
  reportError,
}))

const { getEmbedToken, initTokenRefreshLoop, initializePowerBI } =
  await import('./services')
const { showError } = await import('./services.lib')

const signalReady = mock(() => {})

function setScreenly(settings: Record<string, unknown>) {
  ;(globalThis as Record<string, unknown>).screenly = {
    settings,
    signalReadyForRendering: signalReady,
  }
}

function isoFromNow(offsetSec: number): string {
  return new Date(NOW_MS + offsetSec * 1000).toISOString()
}

function okFetch(token: string, expiration: string): typeof fetch {
  return mock(async () => ({
    ok: true,
    json: async () => ({ token, expiration }),
  })) as unknown as typeof fetch
}

function failFetch(message: string, status: number): typeof fetch {
  return mock(async () => ({
    ok: false,
    status,
    json: async () => ({ error: message }),
  })) as unknown as typeof fetch
}

// eslint-disable-next-line max-lines-per-function
describe('services', () => {
  let originalFetch: typeof fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    reportError.mockClear()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    delete (globalThis as Record<string, unknown>).screenly
  })

  describe('getEmbedToken', () => {
    it('when embed_token setting present, should return it without fetching', async () => {
      setScreenly({ embed_token: 'static-token' })
      globalThis.fetch = mock(() => {
        throw new Error('should not fetch')
      }) as unknown as typeof fetch

      const result = await getEmbedToken()

      expect(result).toEqual({ token: 'static-token', expiration: null })
      expect(globalThis.fetch).not.toHaveBeenCalled()
    })

    it('when embed_token setting absent, should fetch token and expiration from endpoint', async () => {
      setScreenly({ ...OAUTH_SETTINGS })
      globalThis.fetch = okFetch('embed-token', '2030-01-01T00:00:00Z')

      const result = await getEmbedToken()

      expect(result).toEqual({
        token: 'embed-token',
        expiration: '2030-01-01T00:00:00Z',
      })
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.example.com/oauth/embed_token/',
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer app-auth',
          },
        },
      )
    })

    it('when response not ok with json error, should throw server message and status', async () => {
      setScreenly({ ...OAUTH_SETTINGS })
      globalThis.fetch = failFetch('PowerBI integration is not connected', 400)

      const error = await getEmbedToken().catch((thrown) => thrown)

      expect(error.message).toBe('PowerBI integration is not connected')
      expect(error.status).toBe(400)
    })

    it('when response not ok without json body, should throw default message and status', async () => {
      setScreenly({ ...OAUTH_SETTINGS })
      globalThis.fetch = mock(async () => ({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('invalid json')
        },
      })) as unknown as typeof fetch

      const error = await getEmbedToken().catch((thrown) => thrown)

      expect(error.message).toBe('Failed to get embed token.')
      expect(error.status).toBe(500)
    })
  })

  describe('initTokenRefreshLoop', () => {
    let scheduled: Array<{ fn: () => unknown; delayMs: number }>
    let originalSetTimeout: typeof setTimeout
    let nowSpy: ReturnType<typeof spyOn>

    beforeEach(() => {
      scheduled = []
      originalSetTimeout = globalThis.setTimeout
      globalThis.setTimeout = ((fn: () => unknown, delayMs: number) => {
        scheduled.push({ fn, delayMs })
        return 0
      }) as unknown as typeof setTimeout
      nowSpy = spyOn(Date, 'now').mockReturnValue(NOW_MS)
      setScreenly({ ...OAUTH_SETTINGS, refresh_interval: '5' })
    })

    afterEach(() => {
      globalThis.setTimeout = originalSetTimeout
      nowSpy.mockRestore()
    })

    function makeReport() {
      return {
        on: mock(() => {}),
        setAccessToken: mock(async () => {}),
      } as unknown as Parameters<typeof initTokenRefreshLoop>[0]
    }

    it('when started, should schedule first refresh from initial expiration', () => {
      initTokenRefreshLoop(makeReport(), isoFromNow(100))

      expect(scheduled[0].delayMs).toBe(60_000)
    })

    it('when refresh succeeds, should set new token and reschedule from new expiration', async () => {
      globalThis.fetch = okFetch('new-token', isoFromNow(200))
      const report = makeReport()
      initTokenRefreshLoop(report, isoFromNow(100))

      await scheduled[0].fn()

      expect(report.setAccessToken).toHaveBeenCalledWith('new-token')
      expect(scheduled[1].delayMs).toBe(120_000)
    })

    it('when refresh fails, should back off and increment error step', async () => {
      globalThis.fetch = failFetch('boom', 500)
      initTokenRefreshLoop(makeReport(), isoFromNow(100))

      await scheduled[0].fn()
      expect(scheduled[1].delayMs).toBe(15_000)

      await scheduled[1].fn()
      expect(scheduled[2].delayMs).toBe(30_000)
    })

    it('when refresh fails repeatedly, should report only first failure to sentry', async () => {
      globalThis.fetch = failFetch('boom', 500)
      initTokenRefreshLoop(makeReport(), isoFromNow(100))

      await scheduled[0].fn()
      await scheduled[1].fn()

      expect(reportError).toHaveBeenCalledTimes(1)
      expect(reportError).toHaveBeenCalledWith(expect.anything(), {
        source: 'token-refresh',
      })
    })
  })

  // eslint-disable-next-line max-lines-per-function
  describe('initializePowerBI', () => {
    beforeEach(() => {
      embedCalls.length = 0
      reportOn.mockClear()
      reportSetAccessToken.mockClear()
      reportReload.mockClear()
      signalReady.mockClear()
      setupDom()
    })

    it('when embedding report, should embed with view permissions and return report', async () => {
      setScreenly({ embed_token: 'static-token', embed_url: REPORT_EMBED_URL })

      const report = await initializePowerBI()

      expect(embedCalls[0].config).toMatchObject({
        accessToken: 'static-token',
        type: 'report',
        tokenType: 'Embed',
        permissions: 'All',
      })
      expect(report).toBe(fakeReport)

      const renderedHandler = reportOn.mock.calls.find(
        (call) => call[0] === 'rendered',
      )?.[1] as () => void
      renderedHandler()
      expect(signalReady).toHaveBeenCalled()
    })

    it('when token retrieval fails, should report, render error, and rethrow', async () => {
      setScreenly({ ...OAUTH_SETTINGS, embed_url: REPORT_EMBED_URL })
      globalThis.fetch = failFetch('Embed token unavailable', 403)

      await expect(initializePowerBI()).rejects.toThrow(
        'Embed token unavailable',
      )

      expect(reportError).toHaveBeenCalledWith(expect.anything(), {
        source: 'embed-token',
      })
      expect(document.querySelector('.error-message')?.textContent).toBe(
        'Embed token unavailable',
      )
    })

    async function embedAndGetErrorHandler() {
      setScreenly({ embed_token: 'static-token', embed_url: REPORT_EMBED_URL })
      await initializePowerBI()
      return reportOn.mock.calls.find(
        (call) => call[0] === 'error',
      )?.[1] as (event: { detail: unknown }) => void
    }

    it('when embed fires non-model error, should report it and render error', async () => {
      const errorHandler = await embedAndGetErrorHandler()

      errorHandler({ detail: { detailedMessage: 'TokenExpired' } })

      const [reportedError, context] = reportError.mock.calls[0] as [
        Error,
        Record<string, unknown>,
      ]
      expect(reportedError.message).toBe('TokenExpired')
      expect(context.source).toBe('powerbi-embed')
      expect(reportReload).not.toHaveBeenCalled()
      expect(document.querySelector('.error-message')?.textContent).toBe(
        'TokenExpired',
      )
    })

    it('when embed fires model-load error, should reload instead of showing error', async () => {
      const errorHandler = await embedAndGetErrorHandler()

      errorHandler({ detail: { message: 'X_FailedToLoadModel_Y' } })

      expect(reportReload).toHaveBeenCalledTimes(1)
      expect(document.querySelector('.error-message')).toBeNull()
    })

    it('when model-load errors exceed max reloads, should show error', async () => {
      const errorHandler = await embedAndGetErrorHandler()
      const modelError = { detail: { message: 'X_FailedToLoadModel_Y' } }

      errorHandler(modelError)
      errorHandler(modelError)
      errorHandler(modelError)
      errorHandler(modelError)

      expect(reportReload).toHaveBeenCalledTimes(3)
      expect(document.querySelector('.error-container')).not.toBeNull()
    })
  })
})

describe('services.lib', () => {
  describe('showError', () => {
    beforeEach(() => {
      setScreenly({})
      signalReady.mockClear()
      setupDom()
    })

    afterEach(() => {
      delete (globalThis as Record<string, unknown>).screenly
    })

    it('when given message and error info, should render them and signal ready', () => {
      showError({
        detailedMessage: 'Unable to load report',
        technicalDetails: { errorInfo: [{ key: 'status', value: 403 }] },
      })

      expect(document.querySelector('.error-message')?.textContent).toBe(
        'Unable to load report',
      )
      expect(document.querySelector('.error-key')?.textContent).toBe('status')
      expect(document.querySelector('.error-value')?.textContent).toBe('403')
      expect(signalReady).toHaveBeenCalled()
    })
  })
})
