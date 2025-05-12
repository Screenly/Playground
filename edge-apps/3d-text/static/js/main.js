/* global screenly */
// eslint-disable-next-line no-unused-vars, no-useless-catch

const container = document.querySelector('.container')
const textElement = document.getElementById('text')
const shadowElement = document.querySelector('.shadow')
const text = screenly.settings.text || screenly.metadata.screen_name || 'Screenly'
const baseColor = screenly.settings.color

// Function to adjust color brightness
function adjustBrightness (color, percent) {
  const num = parseInt(color.replace('#', ''), 16)
  const r = (num >> 16) + percent
  const g = ((num >> 8) & 0x00FF) + percent
  const b = (num & 0x0000FF) + percent

  return '#' + (
    0x1000000 +
        (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
        (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
        (b < 255 ? (b < 1 ? 0 : b) : 255)
  ).toString(16).slice(1)
}

// Generate color variants
const lighterColor = adjustBrightness(baseColor, 30)
const darkerColor = adjustBrightness(baseColor, -30)
const darkestColor = adjustBrightness(baseColor, -80)

// Apply colors to text elements
const style = document.createElement('style')
style.textContent = `
    #text {
        background: linear-gradient(
            to bottom,
            ${lighterColor} 0%,
            ${baseColor} 50%,
            ${darkerColor} 100%
        );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    #text::before {
        color: ${baseColor};
    }

    #text::after {
        background: linear-gradient(
            to bottom,
            ${darkerColor},
            ${darkestColor}
        );
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
    }

    .shadow {
        color: ${baseColor}33;
    }
`
document.head.appendChild(style)

textElement.textContent = text
textElement.setAttribute('data-text', text)
shadowElement.textContent = text

const pos = { x: 100, y: 100 }
const baseSpeed = 180
let velocity = {
  x: baseSpeed * Math.cos(Math.PI / 4),
  y: baseSpeed * Math.sin(Math.PI / 4)
}

let lastTime = null
const rotation = { x: 0, y: 0, z: 0 }
const targetRotation = { x: 0, y: 0, z: 0 }
const rotationSpeed = 2
const maxRotation = 20
const maxZRotation = 15

function lerp (start, end, factor) {
  return start + (end - start) * factor
}

function clampRotation (value, max) {
  return Math.max(-max, Math.min(max, value))
}

function reflect (velocity, normal) {
  const dot = 2 * (velocity.x * normal.x + velocity.y * normal.y)
  return {
    x: velocity.x - dot * normal.x,
    y: velocity.y - dot * normal.y
  }
}

function addSlightRandomness (vector) {
  const angle = Math.atan2(vector.y, vector.x)
  const newAngle = angle + (Math.random() - 0.5) * Math.PI / 18
  const speed = Math.sqrt(vector.x * vector.x + vector.y * vector.y)
  return {
    x: speed * Math.cos(newAngle),
    y: speed * Math.sin(newAngle)
  }
}

function update (currentTime) {
  if (!lastTime) {
    lastTime = currentTime
    requestAnimationFrame(update)
    return
  }

  const deltaTime = (currentTime - lastTime) / 1000
  lastTime = currentTime

  const containerBounds = container.getBoundingClientRect()
  const totalHeight = containerBounds.height

  const maxX = window.innerWidth - containerBounds.width
  const maxY = window.innerHeight - totalHeight
  const minX = 0
  const minY = 0

  let newX = pos.x + velocity.x * deltaTime
  let newY = pos.y + velocity.y * deltaTime

  if (newX <= minX || newX >= maxX) {
    const normal = { x: 1, y: 0 }
    velocity = reflect(velocity, normal)
    velocity = addSlightRandomness(velocity)
    newX = newX <= minX ? minX : maxX
  }

  if (newY <= minY || newY >= maxY) {
    const normal = { x: 0, y: 1 }
    velocity = reflect(velocity, normal)
    velocity = addSlightRandomness(velocity)
    newY = newY <= minY ? minY : maxY
  }

  pos.x = newX
  pos.y = newY

  targetRotation.x = clampRotation((velocity.y / baseSpeed) * maxRotation, maxRotation)
  targetRotation.y = clampRotation(-(velocity.x / baseSpeed) * maxRotation, maxRotation)

  rotation.x = lerp(rotation.x, targetRotation.x, rotationSpeed * deltaTime)
  rotation.y = lerp(rotation.y, targetRotation.y, rotationSpeed * deltaTime)

  rotation.z = Math.sin(currentTime / 1000) * maxZRotation

  container.style.transform = `
        translate3d(${pos.x}px, ${pos.y}px, 0)
        rotateX(${clampRotation(rotation.x, maxRotation)}deg)
        rotateY(${clampRotation(rotation.y, maxRotation)}deg)
        rotateZ(${clampRotation(rotation.z, maxZRotation)}deg)
    `

  requestAnimationFrame(update)
}

requestAnimationFrame(() => {
  const containerBounds = container.getBoundingClientRect()
  pos.x = (window.innerWidth - containerBounds.width) / 2
  pos.y = 0

  velocity = {
    x: baseSpeed * Math.cos(Math.PI / 4),
    y: baseSpeed * Math.sin(Math.PI / 4)
  }

  requestAnimationFrame(update)
})
