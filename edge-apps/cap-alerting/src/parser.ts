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
