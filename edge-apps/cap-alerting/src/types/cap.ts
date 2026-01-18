export interface CAPResource {
  resourceDesc?: string
  mimeType: string
  size?: number
  uri?: string
  derefUri?: string
  digest?: string
  url: string
}

export interface CAPArea {
  areaDesc: string
  polygon?: string | string[]
  circle?: string | string[]
  geocode?: unknown
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
  parameter?: unknown
  eventCode?: unknown
  resources: CAPResource[]
  areas: CAPArea[]
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
}

export type CAPMode = 'test' | 'demo' | 'production'
