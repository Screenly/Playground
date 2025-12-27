export function highlightKeywords(text: string): string {
  const keywords = [
    'DO NOT',
    "DON'T",
    'IMMEDIATELY',
    'IMMEDIATE',
    'NOW',
    'MOVE TO',
    'EVACUATE',
    'CALL',
    'WARNING',
    'DANGER',
    'SHELTER',
    'TAKE COVER',
    'AVOID',
    'STAY',
    'SEEK',
    'TURN AROUND',
    'GET TO',
    'LEAVE',
  ]

  let result = text
  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(
      regex,
      '<strong class="text-red-800 font-black">$1</strong>',
    )
  })

  return result
}
