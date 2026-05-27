export interface CAPResource {
  resourceDesc?: string
  mimeType: string
  size?: number
  uri?: string
  derefUri?: string
  digest?: string
  url: string
}

export interface CAPNameValue {
  valueName?: string
  value?: string | number
}

export interface CAPArea {
  areaDesc: string
  polygon?: string | string[]
  circle?: string | string[]
  geocode?: CAPNameValue | CAPNameValue[]
  altitude?: number
  ceiling?: number
}

export interface CAPInfo {
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
  parameter?: CAPNameValue | CAPNameValue[]
  eventCode?: CAPNameValue | CAPNameValue[]
  resources: CAPResource[]
  areas: CAPArea[]
  // Raw fields from XML parser
  resource?: Record<string, unknown> | Record<string, unknown>[]
  area?: Record<string, unknown> | Record<string, unknown>[]
}

export interface CAPAlert {
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
  // Raw field from XML parser
  info?: Record<string, unknown> | Record<string, unknown>[]
}

export type CAPMode = 'test' | 'demo' | 'production'
