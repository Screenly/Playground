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
