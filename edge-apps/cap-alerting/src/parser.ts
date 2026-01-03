import { CAPInfo, CAPAlert } from './types/cap.js'
import { XMLParser } from 'fast-xml-parser'

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

  const alerts: CAPAlert[] = []

  alertsJson.forEach((a: CAPAlert) => {
    const infosJson = a.info ? (Array.isArray(a.info) ? a.info : [a.info]) : []

    const infos: CAPInfo[] = infosJson.map((info: CAPInfo) => {
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
        resources: resourcesJson.map((res: Record<string, unknown>) => {
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
        areas: areasJson.map((area: Record<string, unknown>) => ({
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
