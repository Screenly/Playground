export * from '@edge-apps/blueprint/ts/utils/calendar'
export * from '@edge-apps/blueprint/ts/utils/locale'
export * from '@edge-apps/blueprint/ts/utils/sentry'

export const getAccessToken = async (): Promise<string> => {
  const response = await fetch(
    screenly.settings.screenly_oauth_tokens_url + 'microsoft_access_token/',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
      },
    },
  )

  const data = await response.json()

  if (!data.token) {
    throw new Error('Invalid response: missing token')
  }
  return data.token
}
