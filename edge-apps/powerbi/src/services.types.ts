export interface EmbedToken {
  token: string
  expiration: string | null
}

export interface PowerBiError {
  detailedMessage?: string
  technicalDetails?: {
    errorInfo?: Array<{ key: string; value: string | number | undefined }>
  }
}
