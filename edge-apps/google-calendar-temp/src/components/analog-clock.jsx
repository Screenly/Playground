import { createSignal, createEffect } from 'solid-js'
import { getTimeZone } from '@/utils'
import '@/components/analog-clock.css'

const AnalogClock = (props) => {
  const [hands, setHands] = createSignal({ hours: 0, minutes: 0, seconds: 0 })

  createEffect(() => {
    const updateClockHands = () => {
      const timeZone = getTimeZone()
      const localTime = new Date(props.now.toLocaleString('en-US', { timeZone }))

      const hours = localTime.getHours()
      const minutes = localTime.getMinutes()
      const seconds = localTime.getSeconds()

      setHands({
        hours: hours * 30 + minutes / 2, // 30 degrees per hour + adjustment for minutes
        minutes: minutes * 6, // 6 degrees per minute
        seconds: seconds * 6 // 6 degrees per second
      })
    }

    updateClockHands()
  })

  // Generate time markers
  const timeMarkers = Array.from({ length: 60 }, (_, i) => (
    <span key={i} style={{ '--index': i + 1 }}>
      <p class={i % 5 === 4 ? 'major-mark' : ''} />
    </span>
  ))

  return (
    <div class='secondary-card calendar-overview-card'>
      <div class='clock'>
        <div class='seconds-bar'>{timeMarkers}</div>
        <div class='hands-box'>
          <div
            class='hand hour'
            style={{ transform: `rotate(${hands().hours}deg)` }}
          >
            <i />
          </div>
          <div
            class='hand minute'
            style={{ transform: `rotate(${hands().minutes}deg)` }}
          >
            <i />
          </div>
          <div
            class='hand second'
            style={{ transform: `rotate(${hands().seconds}deg)` }}
          >
            <i />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalogClock
