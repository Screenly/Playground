export function initSafetyCarousel() {
  const safetyText = document.getElementById('safety-text')
  if (!safetyText) return

  const tips = [
    '⚠ Always wear PPE',
    '🧤 Use gloves properly',
    '🚧 Keep emergency exits clear',
    '🤖 Do not bypass safety guards',
    '🛑 Stop machine if abnormal sound occurs',
  ]

  let index = 0
  safetyText.textContent = tips[index]

  setInterval(() => {
    safetyText.classList.add('opacity-0')

    setTimeout(() => {
      index = (index + 1) % tips.length
      safetyText.textContent = tips[index]
      safetyText.classList.remove('opacity-0')
    }, 400)
  }, 5000)
}
