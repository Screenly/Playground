import {
  setupTheme,
  signalReady,
  getMetadata,
  getTags,
  getSettings,
  getCorsProxyUrl,
} from '../edge-apps-library/src/index'

import { XMLParser } from 'fast-xml-parser'
import { CAPFetcher } from './src/fetcher'

interface CAPResource {
  resourceDesc?: string
  mimeType: string
  size?: number
  uri?: string
  derefUri?: string
  digest?: string
  url: string
}

interface CAPArea {
  areaDesc: string
  polygon?: string | string[]
  circle?: string | string[]
  geocode?: any
  altitude?: number
  ceiling?: number
}

interface CAPInfo {
  language: string
  category?: string | string[]
  event?: string
  responseType?: string | string[]
  urgency?: string
  severity?: string
  certainty?: string
  audience?: string
  effective?: string
  onset?: string
  expires?: string
  senderName?: string
  headline?: string
  description?: string
  instruction?: string
  web?: string
  contact?: string
  parameter?: any
  eventCode?: any
  resources: CAPResource[]
  areas: CAPArea[]
}

interface CAPAlert {
  identifier: string
  sender: string
  sent: string
  status?: string
  msgType?: string
  source?: string
  scope?: string
  restriction?: string
  addresses?: string
  code?: string | string[]
  note?: string
  references?: string
  incidents?: string
  infos: CAPInfo[]
}

export function parseCap(xml: string): CAPAlert[] {
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

// Legacy cache migration - convert old cache to new format
function migrateLegacyCache(): void {
  try {
    const oldCache = localStorage.getItem('cap_last')
    const newCache = localStorage.getItem('cap_feed_cache')
    
    if (oldCache && !newCache) {
      console.log('Migrating legacy cache to new format')
      localStorage.setItem('cap_feed_cache', oldCache)
      localStorage.setItem('cap_feed_cache_meta', JSON.stringify({
        data: '',
        timestamp: Date.now(),
        isValid: true,
      }))
      localStorage.removeItem('cap_last')
    }
  } catch (err) {
    console.error('Failed to migrate legacy cache:', err)
  }
}

function highlightKeywords(text: string): string {
  const keywords = [
    'DO NOT',
    'DON\'T',
    'DO NOT',
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
  ]

  let result = text
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(regex, '<strong>$1</strong>')
  })

  return result
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function getStatusBannerInfo(status?: string, msgType?: string): { text: string; classes: string } | null {
  const statusLower = (status || '').toLowerCase()
  const msgTypeLower = (msgType || '').toLowerCase()

  // Per CAP spec: status = Actual | Exercise | System | Test | Draft
  if (statusLower === 'exercise') {
    return {
      text: 'EXERCISE - THIS IS A DRILL',
      classes: 'bg-blue-600 text-white border-blue-800',
    }
  }
  if (statusLower === 'test') {
    return {
      text: 'TEST MESSAGE - NOT AN ACTUAL ALERT',
      classes: 'bg-gray-800 text-white border-gray-900',
    }
  }
  if (statusLower === 'system') {
    return {
      text: 'SYSTEM MESSAGE',
      classes: 'bg-gray-800 text-white border-gray-900',
    }
  }
  if (statusLower === 'draft') {
    return null // Don't show banner for drafts
  }

  // Per CAP spec: msgType = Alert | Update | Cancel | Ack | Error
  if (msgTypeLower === 'update') {
    return {
      text: 'UPDATED ALERT',
      classes: 'bg-orange-600 text-white border-orange-600',
    }
  }
  if (msgTypeLower === 'cancel') {
    return {
      text: 'ALERT CANCELLED',
      classes: 'bg-gray-800 text-white border-gray-900',
    }
  }

  // For Actual alerts with msgType=Alert, no context banner needed
  return null
}

function getSeverityClasses(severity?: string, urgency?: string): string {
  const sev = (severity || '').toLowerCase()
  const urg = (urgency || '').toLowerCase()

  if (sev === 'extreme' || urg === 'immediate') {
    return 'bg-red-600 text-white border-red-800 status-actual-pulse'
  }
  if (sev === 'severe') {
    return 'bg-orange-500 text-white border-yellow-600'
  }
  if (sev === 'moderate') {
    return 'bg-yellow-400 text-black border-yellow-600'
  }
  return 'bg-blue-600 text-white border-blue-800'
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
    if (!info) return

    const card = document.createElement('div')
    card.className = 'alert-card w-[90vw] mx-[5vw] my-[3vh] bg-gray-100 rounded-xl overflow-hidden flex flex-col'

    // Use actual CAP status and msgType fields per CAP v1.2 spec
    const statusBannerInfo = getStatusBannerInfo(alert.status, alert.msgType)
    
    // Only show context banner for Exercise/Test/System/Update/Cancel
    if (statusBannerInfo) {
      const statusBanner = document.createElement('div')
      statusBanner.className = `${statusBannerInfo.classes} py-[2vh] px-[4vw] border-b-[1vh] status-stripe-pattern`
      const statusText = document.createElement('div')
      statusText.className = 'status-banner-text font-black uppercase tracking-[0.15em] text-center leading-none'
      statusText.textContent = statusBannerInfo.text
      statusBanner.appendChild(statusText)
      card.appendChild(statusBanner)
    }

    const contentWrapper = document.createElement('div')
    contentWrapper.className = 'px-[4vw] py-[3vh] flex-1 overflow-y-auto'

    const eventTitle = document.createElement('h1')
    eventTitle.className = 'event-title-text font-black text-red-600 uppercase leading-tight mb-[2vh]'
    eventTitle.textContent = info.event || alert.identifier
    contentWrapper.appendChild(eventTitle)

    const metaParts: string[] = []
    if (info.urgency) metaParts.push(info.urgency.toUpperCase())
    if (info.severity) metaParts.push(info.severity.toUpperCase())
    if (info.certainty) metaParts.push(info.certainty.toUpperCase())

    if (metaParts.length > 0) {
      const badge = document.createElement('div')
      badge.className = `severity-badge-text inline-block bg-orange-500 text-white font-extrabold uppercase px-[4vw] py-[2vh] rounded-lg mb-[3vh] tracking-wider leading-none`
      badge.textContent = metaParts.join(' ')
      contentWrapper.appendChild(badge)
    }

    // Only show description if it adds new information beyond event name and context
    // Per digital signage best practices: avoid redundancy
    if (info.description) {
      const desc = document.createElement('p')
      desc.className = 'body-text text-black leading-snug mb-[3vh]'
      desc.textContent = info.description
      contentWrapper.appendChild(desc)
    }

    if (info.instruction) {
      let instr = info.instruction
      if (nearestExit) {
        if (instr.includes('{{closest_exit}}') || instr.includes('[[closest_exit]]')) {
          instr = instr
            .replace(/\{\{closest_exit\}\}/g, nearestExit)
            .replace(/\[\[closest_exit\]\]/g, nearestExit)
        } else {
          instr += `\n\nNearest exit: ${nearestExit}`
        }
      }

      const instructionBox = document.createElement('div')
      instructionBox.className = 'bg-yellow-100 border-l-[1vw] border-yellow-600 px-[4vw] py-[3vh] rounded-lg'

      const sentences = splitIntoSentences(instr)

      if (sentences.length > 2) {
        const ul = document.createElement('ul')
        ul.className = 'instruction-text text-black leading-snug'
        sentences.forEach((sentence) => {
          const li = document.createElement('li')
          li.className = 'mb-[2vh] flex'
          li.innerHTML = `<span class="mr-[2vw] flex-shrink-0 font-extrabold">•</span><span class="flex-1">${highlightKeywords(sentence)}</span>`
          ul.appendChild(li)
        })
        instructionBox.appendChild(ul)
      } else {
        const instP = document.createElement('p')
        instP.className = 'instruction-text text-black leading-snug whitespace-pre-line'
        instP.innerHTML = highlightKeywords(instr)
        instructionBox.appendChild(instP)
      }

      contentWrapper.appendChild(instructionBox)
    }

    info.resources.forEach((res) => {
      if (res.mimeType && res.mimeType.startsWith('image')) {
        const imgWrapper = document.createElement('div')
        imgWrapper.className = 'mt-[4vh] flex justify-center'
        const img = document.createElement('img')
        img.src = res.url
        img.className = 'max-w-full max-h-[20vh] object-contain rounded-lg'
        imgWrapper.appendChild(img)
        contentWrapper.appendChild(imgWrapper)
      } else if (res.mimeType && res.mimeType.startsWith('audio') && playAudio) {
        const audio = document.createElement('audio')
        audio.src = res.url
        audio.controls = true
        audio.className = 'w-full mt-[4vh]'
        contentWrapper.appendChild(audio)
        audio.play().catch(() => {
          /* autoplay blocked */
        })
      }
    })

    card.appendChild(contentWrapper)
    container.appendChild(card)
  })
}

export async function startApp(): Promise<void> {
  setupTheme()
  migrateLegacyCache()

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
  const lang = (settings.language as string) || 'en'
  const maxAlerts = parseInt((settings.max_alerts as string) || '3', 10)
  const playAudio = ((settings.audio_alert as string) || 'false') === 'true'
  const offlineMode = ((settings.offline_mode as string) || 'false') === 'true'
  const testMode = ((settings.test_mode as string) || 'false') === 'true'
  const demoMode = ((settings.demo_mode as string) || 'false') === 'true'

  const tags: string[] = metadata.tags || []
  const nearestExit = getNearestExit(tags)

  let fetcher: CAPFetcher | null = null

  function handleUpdate(xml: string | null) {
    if (xml) {
      try {
        const alerts = parseCap(xml)
        renderAlerts(alerts, nearestExit, lang, maxAlerts, playAudio)
      } catch (err) {
        console.error('Failed to parse or render alerts:', err)
        // Don't crash, keep displaying previous content
      }
    } else {
      console.warn('No CAP data available')
    }
  }

  // For test mode and demo mode, use static files
  if (testMode) {
    try {
      const resp = await fetch('static/test.cap')
      const xml = resp.ok ? await resp.text() : null
      handleUpdate(xml)
      signalReady()
    } catch (err) {
      console.error('Failed to load test data:', err)
      signalReady()
    }
  } else if (demoMode && !feedUrl) {
    // For demo mode without feed URL, rotate through demo files
    const demoFiles = [
      'static/demo-1-tornado.cap',
      'static/demo-2-fire.cap',
      'static/demo-3-flood.cap',
      'static/demo-4-earthquake.cap',
      'static/demo-5-hazmat.cap',
      'static/demo-6-shooter.cap',
    ]
    let currentIndex = 0

    const loadDemoFile = async () => {
      try {
        const resp = await fetch(demoFiles[currentIndex])
        const xml = resp.ok ? await resp.text() : null
        handleUpdate(xml)
        currentIndex = (currentIndex + 1) % demoFiles.length
      } catch (err) {
        console.error('Failed to load demo file:', err)
      }
    }

    await loadDemoFile()
    signalReady()

    // Rotate demo files every 30 seconds
    setInterval(loadDemoFile, 30000)
  } else if (!offlineMode && feedUrl) {
    // Use the robust fetcher for live feeds
    fetcher = new CAPFetcher({
      feedUrl,
      refreshInterval: 30, // Hardcoded to 30 seconds as requested
      maxRetries: 5,
      initialRetryDelay: 1000,
      maxRetryDelay: 30000,
      corsProxyUrl: getCorsProxyUrl(),
    })

    // Start the fetcher - it will handle initial load and periodic updates
    fetcher.start((xml) => {
      handleUpdate(xml)
      
      // Signal ready after first update
      if (!offlineMode) {
        signalReady()
      }
    })

    // Log stats periodically for debugging
    setInterval(() => {
      if (fetcher) {
        const stats = fetcher.getStats()
        console.log('Fetcher stats:', stats)
      }
    }, 60000) // Log every minute
  } else if (offlineMode) {
    // In offline mode, just load from cache
    const cached = localStorage.getItem('cap_feed_cache')
    handleUpdate(cached)
    signalReady()
  } else {
    console.warn('No feed URL configured and not in demo mode')
    signalReady()
  }

  // Add a global reference for debugging
  if (typeof window !== 'undefined') {
    ;(window as any).capFetcher = fetcher
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  startApp()
}
