import {
  setupTheme,
  signalReady,
  getMetadata,
  getTags,
  getSettings,
  getCorsProxyUrl,
} from '../edge-apps-library/src/index'

import { XMLParser } from 'fast-xml-parser'

interface CAPInfo {
  language: string
  category?: string
  event?: string
  urgency?: string
  severity?: string
  certainty?: string
  headline?: string
  description?: string
  instruction?: string
  resources: { mimeType: string; url: string }[]
  areas: string[]
  expires?: string
}

interface CAPAlert {
  identifier: string
  sender: string
  sent: string
  status?: string
  msgType?: string
  scope?: string
  infos: CAPInfo[]
}

function parseCap(xml: string): CAPAlert[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const json: any = parser.parse(xml)
  const alertsJson = json.alert ? (Array.isArray(json.alert) ? json.alert : [json.alert]) : []

  const alerts: CAPAlert[] = []

  alertsJson.forEach((a: any) => {
    const infosJson = a.info ? (Array.isArray(a.info) ? a.info : [a.info]) : []

    const infos: CAPInfo[] = infosJson.map((info: any) => {
      const resourcesJson = info.resource
        ? Array.isArray(info.resource)
          ? info.resource
          : [info.resource]
        : []
      const areasJson = info.area ? (Array.isArray(info.area) ? info.area : [info.area]) : []

      return {
        language: info.language || '',
        category: info.category,
        event: info.event,
        urgency: info.urgency,
        severity: info.severity,
        certainty: info.certainty,
        headline: info.headline,
        description: info.description,
        instruction: info.instruction,
        resources: resourcesJson.map((res: any) => {
          return {
            mimeType: res.mimeType || res['mimeType'],
            url: res.uri || res.resourceDesc || '',
          }
        }),
        areas: areasJson.map((area: any) => area.areaDesc || '').filter((s: string) => s),
        expires: info.expires,
      }
    })

    alerts.push({
      identifier: a.identifier || '',
      sender: a.sender || '',
      sent: a.sent || '',
      status: a.status,
      msgType: a.msgType,
      scope: a.scope,
      infos,
    })
  })

  return alerts
}

function getNearestExit(tags: string[]): string | undefined {
  for (const tag of tags) {
    const lower = tag.toLowerCase()
    if (lower.startsWith('exit:')) {
      return tag.slice(5).trim()
    }
    if (lower.startsWith('exit-')) {
      return tag.slice(5).trim()
    }
  }
  return undefined
}

async function fetchCapData(feedUrl: string, offlineMode: boolean): Promise<string | null> {
  if (offlineMode) {
    return localStorage.getItem('cap_last')
  }

  try {
    const cors = getCorsProxyUrl()
    let url = feedUrl
    if (feedUrl && feedUrl.match(/^https?:/)) {
      url = `${cors}/${feedUrl}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const text = await response.text()
    localStorage.setItem('cap_last', text)
    return text
  } catch (err) {
    console.warn('CAP fetch failed', err)
    return localStorage.getItem('cap_last')
  }
}

function renderAlerts(
  alerts: CAPAlert[],
  nearestExit: string | undefined,
  lang: string,
  maxAlerts: number,
  playAudio: boolean
): void {
  const container = document.getElementById('alerts')
  if (!container) return

  container.innerHTML = ''
  const slice = alerts.slice(0, maxAlerts)

  slice.forEach((alert) => {
    const info = alert.infos.find((i) => i.language === lang) ?? alert.infos[0]
    const card = document.createElement('div')
    card.className = 'alert-card'

    const header = document.createElement('h2')
    header.textContent = info.event || alert.identifier
    card.appendChild(header)

    const meta = document.createElement('div')
    meta.className = 'meta'
    meta.textContent = `${info.urgency || ''} ${info.severity || ''} ${info.certainty || ''}`.trim()
    card.appendChild(meta)

    if (info.headline) {
      const headline = document.createElement('h3')
      headline.textContent = info.headline
      card.appendChild(headline)
    }

    if (info.description) {
      const desc = document.createElement('p')
      desc.textContent = info.description
      card.appendChild(desc)
    }

    if (info.instruction) {
      let instr = info.instruction
      if (nearestExit) {
        if (instr.includes('{{closest_exit}}') || instr.includes('[[closest_exit]]')) {
          instr = instr
            .replace(/\{\{closest_exit\}\}/g, nearestExit)
            .replace(/\[\[closest_exit\]\]/g, nearestExit)
        } else {
          instr += `\nNearest exit: ${nearestExit}`
        }
      }
      const instEl = document.createElement('p')
      instEl.className = 'instruction'
      instEl.textContent = instr
      card.appendChild(instEl)
    }

    info.resources.forEach((res) => {
      if (res.mimeType.startsWith('image')) {
        const img = document.createElement('img')
        img.src = res.url
        card.appendChild(img)
      } else if (res.mimeType.startsWith('audio') && playAudio) {
        const audio = document.createElement('audio')
        audio.src = res.url
        audio.controls = true
        card.appendChild(audio)
        audio.play().catch(() => {
          /* autoplay blocked */
        })
      }
    })

    container.appendChild(card)
  })
}

async function startApp(): Promise<void> {
  setupTheme()

  let settings: Partial<ReturnType<typeof getSettings>> = {}
  let metadata: Partial<ReturnType<typeof getMetadata>> = {}

  try {
    settings = getSettings()
    localStorage.setItem('screenly_settings', JSON.stringify(settings))
  } catch (_) {
    const cached = localStorage.getItem('screenly_settings')
    settings = cached ? (JSON.parse(cached) as Partial<ReturnType<typeof getSettings>>) : {}
  }

  try {
    metadata = getMetadata()
    localStorage.setItem('screenly_metadata', JSON.stringify(metadata))
  } catch (_) {
    const cachedMeta = localStorage.getItem('screenly_metadata')
    metadata = cachedMeta ? (JSON.parse(cachedMeta) as Partial<ReturnType<typeof getMetadata>>) : {}
  }

  const feedUrl: string = (settings.cap_feed_url as string) || ''
  const interval = parseInt((settings.refresh_interval as string) || '5', 10)
  const lang = (settings.language as string) || 'en'
  const maxAlerts = parseInt((settings.max_alerts as string) || '3', 10)
  const playAudio = ((settings.audio_alert as string) || 'false') === 'true'
  const offlineMode = ((settings.offline_mode as string) || 'false') === 'true'
  const testMode = ((settings.test_mode as string) || 'false') === 'true'
  const demoMode = ((settings.demo_mode as string) || 'false') === 'true'

  const tags: string[] = metadata.tags || []
  const nearestExit = getNearestExit(tags)

  async function update() {
    let xml: string | null

    if (testMode) {
      try {
        const resp = await fetch('static/test.cap')
        xml = resp.ok ? await resp.text() : null
      } catch (_) {
        xml = null
      }
    } else if (demoMode && !feedUrl) {
      const demoFiles = ['static/demo.cap', 'static/demo-severe.cap', 'static/demo-extreme.cap']
      const randomFile = demoFiles[Math.floor(Math.random() * demoFiles.length)]
      try {
        const resp = await fetch(randomFile)
        xml = resp.ok ? await resp.text() : null
      } catch (_) {
        xml = null
      }
    } else {
      xml = await fetchCapData(feedUrl, offlineMode)
    }

    if (xml) {
      const alerts = parseCap(xml)
      renderAlerts(alerts, nearestExit, lang, maxAlerts, playAudio)
    } else {
      console.warn('No CAP data available')
    }
  }

  await update()
  signalReady()

  setInterval(update, interval * 60 * 1000)
}

startApp()
