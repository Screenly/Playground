import {
  setupTheme,
  signalReady,
  getMetadata,
  getTags,
  getSettings,
  getCorsProxyUrl,
  isAnywhereScreen,
} from '@screenly/edge-apps'

import { CAPInfo, CAPAlert } from './types/cap.js'
import { XMLParser } from 'fast-xml-parser'

const DEMO_BASE_URL =
  'https://raw.githubusercontent.com/Screenly/Playground/refs/heads/master/edge-apps/cap-alerting'

export function parseCap(xml: string): CAPAlert[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })
  const json: any = parser.parse(xml)
  const alertsJson = json.alert
    ? Array.isArray(json.alert)
      ? json.alert
      : [json.alert]
    : []

  const alerts: CAPAlert[] = []

  alertsJson.forEach((a: any) => {
    const infosJson = a.info ? (Array.isArray(a.info) ? a.info : [a.info]) : []

    const infos: CAPInfo[] = infosJson.map((info: any) => {
      const resourcesJson = info.resource
        ? Array.isArray(info.resource)
          ? info.resource
          : [info.resource]
        : []
      const areasJson = info.area
        ? Array.isArray(info.area)
          ? info.area
          : [info.area]
        : []

      return {
        language: info.language || '',
        category: info.category,
        event: info.event,
        responseType: info.responseType,
        urgency: info.urgency,
        severity: info.severity,
        certainty: info.certainty,
        audience: info.audience,
        effective: info.effective,
        onset: info.onset,
        expires: info.expires,
        senderName: info.senderName,
        headline: info.headline,
        description: info.description,
        instruction: info.instruction,
        web: info.web,
        contact: info.contact,
        parameter: info.parameter,
        eventCode: info.eventCode,
        resources: resourcesJson.map((res: any) => {
          return {
            resourceDesc: res.resourceDesc,
            mimeType: res.mimeType || res['mimeType'],
            size: res.size,
            uri: res.uri,
            derefUri: res.derefUri,
            digest: res.digest,
            url: res.uri || res.resourceDesc || '',
          }
        }),
        areas: areasJson.map((area: any) => ({
          areaDesc: area.areaDesc || '',
          polygon: area.polygon,
          circle: area.circle,
          geocode: area.geocode,
          altitude: area.altitude,
          ceiling: area.ceiling,
        })),
      }
    })

    alerts.push({
      identifier: a.identifier || '',
      sender: a.sender || '',
      sent: a.sent || '',
      status: a.status,
      msgType: a.msgType,
      source: a.source,
      scope: a.scope,
      restriction: a.restriction,
      addresses: a.addresses,
      code: a.code,
      note: a.note,
      references: a.references,
      incidents: a.incidents,
      infos,
    })
  })

  return alerts
}

export function getNearestExit(tags: string[]): string | undefined {
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

async function fetchCapData(
  feedUrl: string,
  offlineMode: boolean,
): Promise<string | null> {
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

function highlightKeywords(text: string): string {
  const keywords = [
    'DO NOT',
    "DON'T",
    'IMMEDIATELY',
    'IMMEDIATE',
    'NOW',
    'MOVE TO',
    'EVACUATE',
    'CALL',
    'WARNING',
    'DANGER',
    'SHELTER',
    'TAKE COVER',
    'AVOID',
    'STAY',
    'SEEK',
    'TURN AROUND',
    'GET TO',
    'LEAVE',
  ]

  let result = text
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(
      regex,
      '<strong class="text-red-800 font-black">$1</strong>',
    )
  })

  return result
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function proxyUrl(url: string): string {
  if (url && url.match(/^https?:/)) {
    const cors = getCorsProxyUrl()
    return `${cors}/${url}`
  }
  return url
}

function renderAlerts(
  alerts: CAPAlert[],
  nearestExit: string | undefined,
  lang: string,
  maxAlerts: number,
  playAudio: boolean,
): void {
  const container = document.getElementById('alerts')
  if (!container) return

  container.innerHTML = ''
  const slice = alerts.slice(0, maxAlerts)

  slice.forEach((alert) => {
    const info = alert.infos.find((i) => i.language === lang) ?? alert.infos[0]
    if (!info) return

    const card = document.createElement('div')
    card.className =
      'alert-card w-full h-full bg-white flex flex-col overflow-y-auto'

    if (alert.status) {
      const statusBanner = document.createElement('div')

      let baseClasses =
        'w-full text-center font-black uppercase tracking-[0.15em] flex-shrink-0 status-stripe-pattern status-banner-text py-[2.5vh] px-[4vw] text-white '

      let statusText = alert.status.toUpperCase()
      if (alert.status === 'Exercise') {
        statusText = 'EXERCISE - THIS IS A DRILL'
        baseClasses += 'status-banner-blue'
      } else if (alert.status === 'Test') {
        statusText = 'TEST - NOT A REAL EMERGENCY'
        baseClasses += 'status-banner-gray'
      } else if (alert.status === 'System') {
        statusText = 'SYSTEM TEST'
        baseClasses += 'status-banner-gray'
      } else if (alert.status === 'Draft') {
        statusText = 'DRAFT - NOT ACTIVE'
        baseClasses += 'status-banner-orange'
      } else if (alert.status === 'Actual') {
        statusText = 'ACTUAL EMERGENCY'
        baseClasses += 'status-banner-red status-actual-pulse'
      }

      statusBanner.className = baseClasses
      statusBanner.textContent = statusText
      card.appendChild(statusBanner)
    }

    const headerRow = document.createElement('div')
    headerRow.className =
      'flex items-center justify-between gap-[2vw] mx-[5vw] mt-[2vh] mb-[1.5vh]'

    const header = document.createElement('h2')
    header.className =
      'text-red-600 font-black uppercase leading-none event-title-text'
    header.textContent = info.event || alert.identifier
    headerRow.appendChild(header)

    const meta = document.createElement('div')
    meta.className =
      'severity-badge inline-block text-white rounded-xl font-black uppercase tracking-wider flex-shrink-0 severity-badge-text px-[4vw] py-[2vh]'
    meta.textContent =
      `${info.urgency || ''} ${info.severity || ''} ${info.certainty || ''}`.trim()
    headerRow.appendChild(meta)

    card.appendChild(headerRow)

    if (info.headline) {
      const headline = document.createElement('h3')
      headline.className =
        'font-extrabold leading-tight flex-shrink-0 headline-text text-gray-900 '
      headline.className += 'mx-[5vw] mb-[1.5vh]'
      headline.textContent = info.headline
      card.appendChild(headline)
    }

    if (info.description) {
      const desc = document.createElement('p')
      desc.className = 'font-semibold leading-snug body-text text-gray-800 '
      desc.className += 'mx-[5vw] mb-[2vh]'
      desc.textContent = info.description
      card.appendChild(desc)
    }

    if (info.instruction) {
      let instr = info.instruction
      if (nearestExit) {
        if (
          instr.includes('{{closest_exit}}') ||
          instr.includes('[[closest_exit]]')
        ) {
          instr = instr
            .replace(/\{\{closest_exit\}\}/g, nearestExit)
            .replace(/\[\[closest_exit\]\]/g, nearestExit)
        } else {
          instr += `\n\nNearest exit: ${nearestExit}`
        }
      }

      const instructionBox = document.createElement('div')
      instructionBox.className =
        'instruction-box rounded-xl flex-shrink-0 px-[4vw] py-[2.5vh] mx-[5vw] mb-[2vh]'

      const sentences = splitIntoSentences(instr)

      if (sentences.length > 2) {
        const ul = document.createElement('ul')
        ul.className = 'instruction-text leading-snug text-gray-900'
        sentences.forEach((sentence) => {
          const li = document.createElement('li')
          li.className = 'mb-[1vh] flex items-start'
          const bullet = document.createElement('span')
          bullet.className = 'mr-[2vw] flex-shrink-0 font-black text-orange-600'
          bullet.textContent = '•'
          const content = document.createElement('span')
          content.className = 'flex-1 font-extrabold'
          content.innerHTML = highlightKeywords(sentence)
          li.appendChild(bullet)
          li.appendChild(content)
          ul.appendChild(li)
        })
        instructionBox.appendChild(ul)
      } else {
        const instP = document.createElement('p')
        instP.className =
          'instruction-text font-extrabold leading-snug whitespace-pre-line text-gray-900'
        instP.innerHTML = highlightKeywords(instr)
        instructionBox.appendChild(instP)
      }

      card.appendChild(instructionBox)
    }

    info.resources.forEach((res) => {
      if (res.mimeType && res.mimeType.startsWith('image')) {
        const imgWrapper = document.createElement('div')
        imgWrapper.className = 'mx-[5vw] my-[2vh]'
        const img = document.createElement('img')
        img.className =
          'max-w-full max-h-[20vh] rounded-2xl object-contain shadow-lg'
        img.src = proxyUrl(res.url)
        imgWrapper.appendChild(img)
        card.appendChild(imgWrapper)
      } else if (
        res.mimeType &&
        res.mimeType.startsWith('audio') &&
        playAudio
      ) {
        const proxiedUrl = proxyUrl(res.url)
        console.log(
          'Creating audio player for:',
          res.url,
          '-> proxied:',
          proxiedUrl,
          'MIME type:',
          res.mimeType,
        )
        const audio = document.createElement('audio')
        audio.className = 'w-[90vw] flex-shrink-0 mx-[5vw] my-[2vh] rounded-xl'
        audio.style.height = 'clamp(3rem, 5vh, 10rem)'
        audio.src = proxiedUrl
        audio.controls = true
        audio.autoplay = true
        audio.preload = 'auto'
        audio.crossOrigin = 'anonymous'
        card.appendChild(audio)

        audio.addEventListener('loadeddata', () => {
          console.log('Audio loaded successfully:', proxiedUrl)
        })

        audio.addEventListener('error', (e) => {
          console.error('Audio load error:', proxiedUrl, e)
        })

        audio.play().catch((err) => {
          console.warn(
            'Autoplay blocked or failed:',
            err.message,
            '- Click play button to start audio',
          )
        })
      }
    })

    container.appendChild(card)
  })
}

export async function startApp(): Promise<void> {
  setupTheme()

  let settings: Partial<ReturnType<typeof getSettings>> = {}
  let metadata: Partial<ReturnType<typeof getMetadata>> = {}

  try {
    settings = getSettings()
    localStorage.setItem('screenly_settings', JSON.stringify(settings))
  } catch (_) {
    const cached = localStorage.getItem('screenly_settings')
    settings = cached
      ? (JSON.parse(cached) as Partial<ReturnType<typeof getSettings>>)
      : {}
  }

  try {
    metadata = getMetadata()
    localStorage.setItem('screenly_metadata', JSON.stringify(metadata))
  } catch (_) {
    const cachedMeta = localStorage.getItem('screenly_metadata')
    metadata = cachedMeta
      ? (JSON.parse(cachedMeta) as Partial<ReturnType<typeof getMetadata>>)
      : {}
  }

  const feedUrl: string = (settings.cap_feed_url as string) || ''
  const interval = parseInt((settings.refresh_interval as string) || '5', 10)
  const lang = (settings.language as string) || 'en'
  const maxAlerts = parseInt((settings.max_alerts as string) || '3', 10)
  const playAudio = ((settings.audio_alert as string) || 'false') === 'true'
  const offlineMode = ((settings.offline_mode as string) || 'false') === 'true'
  const testMode = ((settings.test_mode as string) || 'false') === 'true'
  const demoMode = ((settings.demo_mode as string) || 'false') === 'true'

  console.log('CAP Settings:', {
    playAudio,
    audio_alert: settings.audio_alert,
    demoMode,
    testMode,
    maxAlerts,
  })

  const tags: string[] = getTags()
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
      const localDemoFiles = [
        'static/demo-1-tornado.cap',
        'static/demo-2-fire.cap',
        'static/demo-3-flood.cap',
        'static/demo-4-earthquake.cap',
        'static/demo-5-hazmat.cap',
        'static/demo-6-shooter.cap',
      ]
      const remoteDemoFiles = localDemoFiles.map(
        (file) => `${DEMO_BASE_URL}/${file}`,
      )
      const demoFiles = isAnywhereScreen() ? remoteDemoFiles : localDemoFiles
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

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.onload = function () {
    startApp()
  }
}
