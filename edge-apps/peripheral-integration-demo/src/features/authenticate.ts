export type RoleScreen = 'operator' | 'maintenance'

// TODO: Replace with a proper implementation backed by real card-to-role data.
const CARD_ROLES: Record<string, RoleScreen> = {
  DEADBEEF: 'operator',
  CAFEBABE: 'maintenance',
}

export function authenticate(cardId: string): RoleScreen | null {
  return CARD_ROLES[cardId] ?? null
}
