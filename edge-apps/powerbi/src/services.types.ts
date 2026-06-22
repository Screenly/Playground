export interface EmbedToken {
  token: string
  expiration: string | null
}

export interface PowerBiError {
  message?: string
  detailedMessage?: string
  technicalDetails?: {
    errorInfo?: Array<{ key: string; value: string | number | undefined }>
  }
}
