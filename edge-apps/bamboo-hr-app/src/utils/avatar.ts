import { useSettingsStore } from '@/stores/settings'

export const fetchEmployeeAvatar = async (
  employeeId: number,
): Promise<string | null> => {
  try {
    const settingsStore = useSettingsStore()
    const bambooHrApiBaseUrl = `https://${settingsStore.subdomain}.bamboohr.com/api/v1`

    const photoResponse = await fetch(
      `${screenly.cors_proxy_url}/${bambooHrApiBaseUrl}/employees/${employeeId}/photo/large`,
      {
        method: 'GET',
        headers: {
          Authorization: `Basic ${btoa(settingsStore.apiKey + ':')}`,
        },
      },
    )

    if (photoResponse.ok) {
      const imageBlob = await photoResponse.blob()
      return URL.createObjectURL(imageBlob)
    }

    return null
  } catch (error) {
    console.warn(`Failed to fetch photo for employee ${employeeId}:`, error)
    return null
  }
}

export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]?.charAt(0) ?? ''
  const firstName = parts.slice(0, -1).join(' ')
  const lastName = parts[parts.length - 1]
  return `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`
}

export const getInitialsFromNames = (
  firstName: string,
  lastName: string,
): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`
}
