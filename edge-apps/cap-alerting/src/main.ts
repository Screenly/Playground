import './input.css'

import {
  setupTheme,
  signalReady,
  getTags,
  getSettingWithDefault,
  setupErrorHandling,
} from '@screenly/edge-apps'

import { CAPAlert, CAPInfo, CAPMode } from './types/cap'
import { parseCap, isNwsAlert, parseNwsTextProduct } from './parser'
import { CAPFetcher } from './fetcher'
import { getNearestExit, splitIntoSentences, proxyUrl } from './utils'
import {
  highlightKeywords,
  renderNwsWwwiContent,
  renderNwsPeriodContent,
} from './render'

function getTemplate(id: string): HTMLTemplateElement {
  const template = document.getElementById(id) as HTMLTemplateElement | null
  if (!template) throw new Error(`Template ${id} not found`)
  return template
}

function createStatusBanner(status: string): HTMLElement {
  const template = getTemplate('status-banner-template')
  const banner = template.content.cloneNode(true) as DocumentFragment
  const bannerEl = banner.firstElementChild as HTMLDivElement

  let baseClasses: string[] = []
  let statusText = status.toUpperCase()
  if (status === 'Exercise') {
    statusText = 'EXERCISE - THIS IS A DRILL'
    baseClasses = ['status-banner-blue']
  } else if (status === 'Test') {
    statusText = 'TEST - NOT A REAL EMERGENCY'
    baseClasses = ['status-banner-gray']
  } else if (status === 'System') {
    statusText = 'SYSTEM TEST'
    baseClasses = ['status-banner-gray']
  } else if (status === 'Draft') {
    statusText = 'DRAFT - NOT ACTIVE'
    baseClasses = ['status-banner-orange']
  } else if (status === 'Actual') {
    statusText = 'ACTUAL EMERGENCY'
    baseClasses = ['status-banner-red', 'status-actual-pulse']
  }

  bannerEl.classList.add(...baseClasses)
  bannerEl.textContent = statusText
  return bannerEl
}

function createHeaderRow(info: CAPInfo, identifier: string): HTMLElement {
  const template = getTemplate('header-row-template')
  const headerRow = template.content.cloneNode(true) as DocumentFragment
  const headerRowEl = headerRow.firstElementChild as HTMLDivElement

  const titleEl = headerRowEl.querySelector('h2') as HTMLHeadingElement
  titleEl.textContent = info.event || identifier

  const metaEl = headerRowEl.querySelector('.severity-badge') as HTMLDivElement
  metaEl.textContent =
    `${info.urgency || ''} ${info.severity || ''} ${info.certainty || ''}`.trim()

  return headerRowEl
}

function createInstructionBox(
  instruction: string,
  nearestExit: string | undefined,
): HTMLElement {
  let instr = instruction
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

  const template = getTemplate('instruction-box-template')
  const instructionBox = template.content.cloneNode(true) as DocumentFragment
  const instructionBoxEl = instructionBox.firstElementChild as HTMLDivElement

  const sentences = splitIntoSentences(instr)

  if (sentences.length > 2) {
    const listTemplate = getTemplate('instruction-list-template')
    const ul = (listTemplate.content.cloneNode(true) as DocumentFragment)
      .firstElementChild as HTMLUListElement
    sentences.forEach((sentence) => {
      const itemTemplate = getTemplate('instruction-list-item-template')
      const li = (itemTemplate.content.cloneNode(true) as DocumentFragment)
        .firstElementChild as HTMLLIElement
      const content = li.querySelector('span:last-child') as HTMLSpanElement
      content.innerHTML = highlightKeywords(sentence)
      ul.appendChild(li)
    })
    instructionBoxEl.appendChild(ul)
  } else {
    const paragraphTemplate = getTemplate('instruction-paragraph-template')
    const p = (paragraphTemplate.content.cloneNode(true) as DocumentFragment)
      .firstElementChild as HTMLParagraphElement
    p.innerHTML = highlightKeywords(instr)
    instructionBoxEl.appendChild(p)
  }

  return instructionBoxEl
}

function renderDescription(
  descriptionEl: HTMLParagraphElement,
  info: CAPInfo,
  senderEmail: string,
): void {
  if (info.description) {
    // Try to parse and render NWS formatted content
    if (isNwsAlert(senderEmail)) {
      const nwsResult = parseNwsTextProduct(info.description)
      if (nwsResult) {
        // Replace the paragraph with the rendered NWS content
        const nwsContent =
          nwsResult.type === 'wwwi'
            ? renderNwsWwwiContent(nwsResult)
            : renderNwsPeriodContent(nwsResult)
        descriptionEl.replaceWith(nwsContent)
      } else {
        descriptionEl.textContent = info.description
      }
    } else {
      descriptionEl.textContent = info.description
    }
  } else {
    descriptionEl.style.display = 'none'
  }
}

function renderResources(
  resourcesContainer: HTMLDivElement,
  info: CAPInfo,
): void {
  info.resources.forEach((res) => {
    if (res.mimeType && res.mimeType.startsWith('image')) {
      // Validate URL protocol before setting img.src
      if (res.url && /^https?:\/\//i.test(res.url)) {
        const imgTemplate = getTemplate('image-resource-template')
        const imgWrapper = (
          imgTemplate.content.cloneNode(true) as DocumentFragment
        ).firstElementChild as HTMLDivElement
        const img = imgWrapper.querySelector('img') as HTMLImageElement
        img.src = proxyUrl(res.url)
        resourcesContainer.appendChild(imgWrapper)
      }
    }
  })
}

function renderAlertCard(
  alert: CAPAlert,
  info: CAPInfo,
  nearestExit: string | undefined,
): HTMLElement {
  const template = getTemplate('alert-card-template')
  const card = (template.content.cloneNode(true) as DocumentFragment)
    .firstElementChild as HTMLDivElement

  const statusContainer = card.querySelector(
    '#status-banner-container',
  ) as HTMLDivElement
  if (alert.status) {
    statusContainer.appendChild(createStatusBanner(alert.status))
  }

  const headerContainer = card.querySelector(
    '#header-row-container',
  ) as HTMLDivElement
  headerContainer.appendChild(createHeaderRow(info, alert.identifier))

  const headlineEl = card.querySelector('#headline') as HTMLHeadingElement
  if (info.headline) {
    headlineEl.textContent = info.headline
  } else {
    headlineEl.style.display = 'none'
  }

  const descriptionEl = card.querySelector(
    '#description',
  ) as HTMLParagraphElement
  renderDescription(descriptionEl, info, alert.sender)

  const instructionContainer = card.querySelector(
    '#instruction-container',
  ) as HTMLDivElement
  if (info.instruction) {
    instructionContainer.appendChild(
      createInstructionBox(info.instruction, nearestExit),
    )
  }

  const resourcesContainer = card.querySelector(
    '#resources-container',
  ) as HTMLDivElement
  renderResources(resourcesContainer, info)

  return card
}

function renderAlerts(
  alerts: CAPAlert[],
  nearestExit: string | undefined,
  lang: string,
  maxAlerts: number,
): void {
  const container = document.getElementById('alerts')
  if (!container) return

  container.innerHTML = ''
  const slice = maxAlerts === Infinity ? alerts : alerts.slice(0, maxAlerts)

  slice.forEach((alert) => {
    const info = alert.infos.find((i) => i.language === lang) ?? alert.infos[0]
    if (!info) return

    const card = renderAlertCard(alert, info, nearestExit)
    container.appendChild(card)
  })
}

export async function startApp(): Promise<void> {
  setupTheme()

  const feedUrl = getSettingWithDefault<string>('cap_feed_url', '')
  const interval = getSettingWithDefault<number>('refresh_interval', 5)
  const lang = getSettingWithDefault<string>('language', 'en')
  const maxAlerts = getSettingWithDefault<number>('max_alerts', Infinity)
  const mode = getSettingWithDefault<CAPMode>('mode', 'production')
  const testMode = mode === 'test'
  const demoMode = mode === 'demo'

  const tags: string[] = getTags()
  const nearestExit = getNearestExit(tags)

  const fetcher = new CAPFetcher({
    testMode,
    demoMode,
    feedUrl,
  })

  async function update() {
    const xml = await fetcher.fetch()
    if (xml) {
      const alerts = parseCap(xml)
      renderAlerts(alerts, nearestExit, lang, maxAlerts)
    } else {
      throw new Error(
        'No CAP data available. Make sure to provide a valid feed URL.',
      )
    }
  }

  await update()
  signalReady()

  setInterval(update, interval * 60 * 1000)
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.onload = function () {
    setupErrorHandling()
    startApp()
  }
}
