export type RoleScreen = 'operator' | 'maintenance'

const CARD_ROLES: Record<string, RoleScreen> = {
  'uhtzBg': 'operator',
  'gj-6XA': 'maintenance',
}

export function authenticate(cardId: string): RoleScreen | null {
  return CARD_ROLES[cardId] ?? null
}
