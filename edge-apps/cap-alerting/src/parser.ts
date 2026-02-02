import { CAPInfo, CAPAlert } from './types/cap.js'
import { XMLParser } from 'fast-xml-parser'

function getStringOrUndefined(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function getNumberOrUndefined(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined
}

function parseResource(res: Record<string, unknown>) {
  const resourceDesc = getStringOrUndefined(res.resourceDesc)
  const mimeType =
    getStringOrUndefined((res as Record<string, unknown>).mimeType) ??
    getStringOrUndefined((res as Record<string, unknown>)['mimeType'])
  const size = getNumberOrUndefined(res.size)
  const uri = getStringOrUndefined(res.uri)
  const derefUri = getStringOrUndefined(res.derefUri)
  const digest = getStringOrUndefined(res.digest)

  return {
    resourceDesc,
    mimeType,
    size,
    uri,
    derefUri,
    digest,
    url: uri ?? resourceDesc ?? '',
  }
}

function parseArea(area: Record<string, unknown>) {
  const areaDesc = getStringOrUndefined(area.areaDesc) ?? ''
  const polygon = getStringOrUndefined(area.polygon) ?? area.polygon
  const circle = getStringOrUndefined(area.circle) ?? area.circle
  const geocode = area.geocode
  const altitude = getNumberOrUndefined(area.altitude) ?? area.altitude
  const ceiling = getNumberOrUndefined(area.ceiling) ?? area.ceiling

  return {
    areaDesc,
    polygon,
    circle,
    geocode,
    altitude,
    ceiling,
  }
}

function parseInfo(info: CAPInfo): CAPInfo {
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
    resources: resourcesJson.map(parseResource),
    areas: areasJson.map(parseArea),
  }
}

function parseAlert(a: CAPAlert): CAPAlert {
  const infosJson = a.info ? (Array.isArray(a.info) ? a.info : [a.info]) : []
  const infos: CAPInfo[] = infosJson.map(parseInfo)

  return {
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
  }
}

export function parseCap(xml: string): CAPAlert[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })
  const json = parser.parse(xml)
  const alertsJson = json.alert
    ? Array.isArray(json.alert)
      ? json.alert
      : [json.alert]
    : []

  return alertsJson.map(parseAlert)
}

/** Represents a single section in NWS formatted content */
export interface NwsSection {
  label: string
  content: string
}

/** Result of parsing NWS WWWI format (What/Where/When/Impacts) */
export interface NwsWwwiResult {
  type: 'wwwi'
  sections: NwsSection[]
}

/** Result of parsing NWS period-based forecast format */
export interface NwsPeriodResult {
  type: 'period'
  preamble: string
  periods: NwsSection[]
}

/** Result of parsing NWS text - either WWWI, period format, or plain text */
export type NwsParseResult = NwsWwwiResult | NwsPeriodResult | null

/**
 * Checks if the CAP alert is from the National Weather Service (NWS).
 * NWS alerts use the sender email: w-nws.webmaster@noaa.gov
 *
 * @param sender - The sender field from the CAP alert
 * @returns true if the alert is from NWS
 */
export function isNwsAlert(sender: string): boolean {
  return sender === 'w-nws.webmaster@noaa.gov'
}

/**
 * Parses NWS "What/Where/When/Impacts" (WWWI) format used in Impact Based Warnings.
 * Returns structured data with sections for rendering.
 *
 * Example input:
 *   "* WHAT...North winds 25 to 30 kt. * WHERE...Pt St George to Cape Mendocino."
 *
 * @param text - The NWS text product description
 * @returns Parsed WWWI result or null if format not detected
 */
export function parseNwsWwwiProduct(text: string): NwsWwwiResult | null {
  if (!text) return null

  // Check if this looks like an NWS WWWI format
  const wwwiPattern =
    /\*\s*(WHAT|WHERE|WHEN|IMPACTS?|ADDITIONAL DETAILS?)\.{3}/i
  if (!wwwiPattern.test(text)) {
    return null
  }

  // Split into sections
  const sections: NwsSection[] = []
  const sectionRegex =
    /\*\s*(WHAT|WHERE|WHEN|IMPACTS?|ADDITIONAL DETAILS?)\.{3}\s*/gi
  let match: RegExpExecArray | null

  // Find all section markers and their positions
  const matches: { label: string; index: number; length: number }[] = []
  while ((match = sectionRegex.exec(text)) !== null) {
    matches.push({
      label: match[1],
      index: match.index,
      length: match[0].length,
    })
  }

  // Extract content for each section
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]
    const contentStart = current.index + current.length
    const contentEnd =
      i < matches.length - 1 ? matches[i + 1].index : text.length
    const content = text.slice(contentStart, contentEnd).trim()

    if (content) {
      sections.push({ label: current.label, content })
    }
  }

  if (sections.length === 0) {
    return null
  }

  return { type: 'wwwi', sections }
}

/**
 * Parses NWS text products that use the legacy .PERIOD... format
 * commonly found in marine forecasts, zone forecasts, and CAP descriptions.
 * Returns structured data with preamble and periods for rendering.
 *
 * Example input:
 *   "Coastal Waters Forecast... .TODAY...E wind 20 kt. .TONIGHT...E wind 20 kt."
 *
 * @param text - The NWS text product description
 * @returns Parsed period result or null if format not detected
 */
export function parseNwsPeriodProduct(text: string): NwsPeriodResult | null {
  if (!text) return null

  // Pattern to match period markers including "AND" combinations like ".SUN AND SUN NIGHT..."
  const periodPattern =
    /\.(TODAY|TONIGHT|TOMORROW|(?:MON|TUES|WEDNES|THURS|FRI|SATUR|SUN)(?:DAY)?|(?:MON|TUE|WED|THU|FRI|SAT|SUN))(\s+(?:AND\s+)?(?:NIGHT|MORNING|AFTERNOON|(?:MON|TUE|WED|THU|FRI|SAT|SUN)(?:\s+NIGHT)?|THROUGH\s+\w+))?\.{3}/gi

  // Check if this looks like an NWS text product with .PERIOD... format
  if (!periodPattern.test(text)) {
    return null
  }

  // Reset regex lastIndex after test
  periodPattern.lastIndex = 0

  // Find the first period marker to split preamble from forecasts
  const firstMatch = periodPattern.exec(text)
  if (!firstMatch) {
    return null
  }

  const preamble = text.slice(0, firstMatch.index).trim()

  // Reset and find all period markers
  periodPattern.lastIndex = 0
  const periods: NwsSection[] = []
  const matches: { label: string; index: number; length: number }[] = []
  let match: RegExpExecArray | null

  while ((match = periodPattern.exec(text)) !== null) {
    const day = match[1]
    const modifier = match[2] || ''
    matches.push({
      label: `${day}${modifier}`.trim(),
      index: match.index,
      length: match[0].length,
    })
  }

  // Extract content for each period
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i]
    const contentStart = current.index + current.length
    const contentEnd =
      i < matches.length - 1 ? matches[i + 1].index : text.length
    const content = text.slice(contentStart, contentEnd).trim()

    if (content) {
      periods.push({ label: current.label, content })
    }
  }

  if (periods.length === 0) {
    return null
  }

  return { type: 'period', preamble, periods }
}

/**
 * Parses NWS text products for improved readability on digital signage.
 * Detects format type and returns structured data:
 * - Period-based forecasts: .TODAY..., .TONIGHT..., .MON..., etc.
 * - Impact Based Warnings (WWWI): * WHAT..., * WHERE..., * WHEN..., * IMPACTS...
 *
 * @param text - The NWS text product description
 * @returns Parsed result or null if no NWS format detected
 */
export function parseNwsTextProduct(text: string): NwsParseResult {
  if (!text) return null

  // Try WWWI format first (Impact Based Warnings)
  const wwwiResult = parseNwsWwwiProduct(text)
  if (wwwiResult) {
    return wwwiResult
  }

  // Try period-based format (marine forecasts, etc.)
  return parseNwsPeriodProduct(text)
}
