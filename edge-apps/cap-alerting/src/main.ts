import {
  setupTheme,
  signalReady,
  getMetadata,
  getTags,
  getSettings,
  getSettingWithDefault,
} from '@screenly/edge-apps'

import { CAPAlert, CAPMode } from './types/cap'
import { parseCap } from './parser'
import { CAPFetcher } from './fetcher'
import { getNearestExit, splitIntoSentences, proxyUrl } from './utils'
import { highlightKeywords } from './render'

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
  const slice = maxAlerts === Infinity ? alerts : alerts.slice(0, maxAlerts)

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
  } catch {
    const cached = localStorage.getItem('screenly_settings')
    settings = cached
      ? (JSON.parse(cached) as Partial<ReturnType<typeof getSettings>>)
      : {}
  }

  try {
    metadata = getMetadata()
    localStorage.setItem('screenly_metadata', JSON.stringify(metadata))
  } catch {
    const cachedMeta = localStorage.getItem('screenly_metadata')
    metadata = cachedMeta
      ? (JSON.parse(cachedMeta) as Partial<ReturnType<typeof getMetadata>>)
      : {}
  }

  const feedUrl = getSettingWithDefault<string>('cap_feed_url', '')
  const interval = getSettingWithDefault<number>('refresh_interval', 5)
  const lang = getSettingWithDefault<string>('language', 'en')
  const maxAlerts = getSettingWithDefault<number>('max_alerts', Infinity)
  const playAudio = !getSettingWithDefault<boolean>('mute_sound', false)
  const offlineMode = getSettingWithDefault<boolean>('offline_mode', false)
  const mode = getSettingWithDefault<CAPMode>('mode', 'production')
  const testMode = mode === 'test'
  const demoMode = mode === 'demo'

  const tags: string[] = getTags()
  const nearestExit = getNearestExit(tags)

  const fetcher = new CAPFetcher({
    testMode,
    demoMode,
    feedUrl,
    offlineMode,
  })

  async function update() {
    const xml = await fetcher.fetch()
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
