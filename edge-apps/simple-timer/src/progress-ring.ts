const ELAPSED_COLOR = '#ac1fff'
const REMAINING_COLOR = 'rgba(255, 255, 255, 0.8)'
const SVG_NS = 'http://www.w3.org/2000/svg'

export function getTickCount(totalSeconds: number): number {
  if (totalSeconds <= 120) return totalSeconds
  if (totalSeconds <= 600) return Math.ceil(totalSeconds / 5)
  return 120
}

export function createProgressRingSVG(
  diameter: number,
  tickCount: number,
): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('width', `${diameter}`)
  svg.setAttribute('height', `${diameter}`)
  svg.setAttribute('viewBox', `0 0 ${diameter} ${diameter}`)

  const cx = diameter / 2
  const cy = diameter / 2
  const outerRadius = diameter / 2 - 4
  const tickLength = diameter * 0.04
  const innerRadius = outerRadius - tickLength

  for (let i = 0; i < tickCount; i++) {
    const angle = (i / tickCount) * 2 * Math.PI - Math.PI / 2
    const x1 = cx + innerRadius * Math.cos(angle)
    const y1 = cy + innerRadius * Math.sin(angle)
    const x2 = cx + outerRadius * Math.cos(angle)
    const y2 = cy + outerRadius * Math.sin(angle)

    const line = document.createElementNS(SVG_NS, 'line')
    line.setAttribute('x1', `${x1}`)
    line.setAttribute('y1', `${y1}`)
    line.setAttribute('x2', `${x2}`)
    line.setAttribute('y2', `${y2}`)
    line.setAttribute('stroke', REMAINING_COLOR)
    line.setAttribute('stroke-width', '2')
    line.setAttribute('stroke-linecap', 'round')
    line.setAttribute('data-tick', `${i}`)
    svg.appendChild(line)
  }

  return svg
}

export function updateProgressRing(svg: SVGSVGElement, progress: number): void {
  const ticks = svg.querySelectorAll('line[data-tick]')
  const tickCount = ticks.length
  const elapsedTicks = Math.floor(progress * tickCount)

  ticks.forEach((tick, i) => {
    tick.setAttribute(
      'stroke',
      i < elapsedTicks ? ELAPSED_COLOR : REMAINING_COLOR,
    )
  })
}
