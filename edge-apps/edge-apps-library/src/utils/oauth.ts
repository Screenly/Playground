/**
 * Retrieves credentials from the Screenly OAuth service
 * @param tokenType The token endpoint type (default: 'access_token')
 * @returns An object containing the token and optional metadata from the OAuth provider
 */
export const getCredentials = async (
  tokenType: string = 'access_token',
): Promise<{ token: string; metadata?: Record<string, unknown> }> => {
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

  const { token, metadata } = await response.json()
  return { token, metadata }
}
