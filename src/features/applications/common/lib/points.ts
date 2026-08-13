const POINTS_PATTERN = /^\d+\.\d{2}$/

export function parsePoints(value: string) {
  if (!POINTS_PATTERN.test(value)) {
    return null
  }

  const [whole, fraction] = value.split('.')
  const minorUnits = Number(whole) * 100 + Number(fraction)
  return Number.isSafeInteger(minorUnits) ? minorUnits : null
}

export function formatPoints(minorUnits: number) {
  if (!Number.isSafeInteger(minorUnits) || minorUnits < 0) {
    throw new RangeError('Point minor units must be a non-negative safe integer')
  }

  const whole = Math.floor(minorUnits / 100)
  const fraction = String(minorUnits % 100).padStart(2, '0')
  return `${whole}.${fraction}`
}

export function sumPoints(values: readonly string[]) {
  let total = 0

  for (const value of values) {
    const parsed = parsePoints(value)
    if (parsed === null || !Number.isSafeInteger(total + parsed)) {
      return null
    }
    total += parsed
  }

  return total
}

export function isPointsIncrement(value: string, increment: string) {
  const parsedValue = parsePoints(value)
  const parsedIncrement = parsePoints(increment)

  return (
    parsedValue !== null &&
    parsedIncrement !== null &&
    parsedIncrement > 0 &&
    parsedValue % parsedIncrement === 0
  )
}
