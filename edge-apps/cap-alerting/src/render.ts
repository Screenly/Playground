import { escapeHtml, getTemplate } from '@screenly/edge-apps'
import { NwsWwwiResult, NwsPeriodResult } from './parser'

export function renderNwsWwwiContent(result: NwsWwwiResult): HTMLElement {
  const template = getTemplate('nws-wwwi-template')
  const fragment = template.content.cloneNode(true) as DocumentFragment
  const list = fragment.querySelector('.nws-wwwi-list') as HTMLUListElement

  const itemTemplate = getTemplate('nws-wwwi-item-template')

  for (const section of result.sections) {
    const itemFragment = itemTemplate.content.cloneNode(
      true,
    ) as DocumentFragment
    const label = itemFragment.querySelector('.wwwi-label') as HTMLElement
    const content = itemFragment.querySelector('.wwwi-content') as HTMLElement

    label.textContent = `${section.label}:`
    content.textContent = ` ${section.content}`

    list.appendChild(itemFragment)
  }

  return list
}

export function renderNwsPeriodContent(result: NwsPeriodResult): HTMLElement {
  const template = getTemplate('nws-forecast-template')
  const fragment = template.content.cloneNode(true) as DocumentFragment
  const container = fragment.querySelector('.nws-content') as HTMLDivElement
  const preambleEl = container.querySelector(
    '.nws-preamble',
  ) as HTMLParagraphElement
  const list = container.querySelector('.nws-forecast-list') as HTMLUListElement

  if (result.preamble) {
    preambleEl.textContent = result.preamble
  } else {
    preambleEl.remove()
  }

  const itemTemplate = getTemplate('nws-forecast-item-template')

  for (const period of result.periods) {
    const itemFragment = itemTemplate.content.cloneNode(
      true,
    ) as DocumentFragment
    const label = itemFragment.querySelector('.period-label') as HTMLElement
    const content = itemFragment.querySelector('.period-content') as HTMLElement

    label.textContent = `${period.label}:`
    content.textContent = ` ${period.content}`

    list.appendChild(itemFragment)
  }

  return container
}

export function highlightKeywords(text: string): string {
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

  let result = escapeHtml(text)
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(
      regex,
      '<strong class="text-red-800 font-black">$1</strong>',
    )
  })

  return result
}
