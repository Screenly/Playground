/**
 * Retrieves an OAuth token from the Screenly OAuth service
 * @param tokenType The token endpoint type (default: 'access_token')
 * @returns The token for the configured OAuth provider
 */
export const getToken = async (
  tokenType: string = 'access_token',
): Promise<string> => {
  const response = await fetch(
    screenly.settings.screenly_oauth_tokens_url + tokenType + '/',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${screenly.settings.screenly_app_auth_token}`,
      },
    },
  )

  const { token } = await response.json()
  return token
}
