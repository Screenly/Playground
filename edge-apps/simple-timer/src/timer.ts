export interface TimerState {
  totalSeconds: number
  remainingSeconds: number
  elapsedSeconds: number
  progress: number
  hours: string
  minutes: string
  seconds: string
  totalLabel: string
  finished: boolean
}

export function padTwo(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

export function formatTotalLabel(totalSeconds: number): string {
  if (totalSeconds >= 3600) {
    const hours = totalSeconds / 3600
    if (Number.isInteger(hours)) {
      return hours === 1 ? 'Total 1 Hour' : `Total ${hours} Hours`
    }
    const h = Math.floor(hours)
    const m = Math.round((totalSeconds % 3600) / 60)
    if (m === 0) return h === 1 ? 'Total 1 Hour' : `Total ${h} Hours`
    return `Total ${h}h ${m}m`
  }

  if (totalSeconds >= 60) {
    const minutes = totalSeconds / 60
    if (Number.isInteger(minutes)) {
      return minutes === 1 ? 'Total 1 Minute' : `Total ${minutes} Minutes`
    }
    const m = Math.floor(minutes)
    const s = totalSeconds % 60
    return `Total ${m}m ${s}s`
  }

  return totalSeconds === 1 ? 'Total 1 Second' : `Total ${totalSeconds} Seconds`
}

export function createTimerState(
  totalDuration: number,
  elapsedSeconds: number,
): TimerState {
  const clamped = Math.min(elapsedSeconds, totalDuration)
  const remaining = totalDuration - clamped
  const finished = clamped >= totalDuration

  const progress = totalDuration > 0 ? clamped / totalDuration : 1

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60

  return {
    totalSeconds: totalDuration,
    remainingSeconds: remaining,
    elapsedSeconds: clamped,
    progress,
    hours: padTwo(h),
    minutes: padTwo(m),
    seconds: padTwo(s),
    totalLabel: formatTotalLabel(totalDuration),
    finished,
  }
}
