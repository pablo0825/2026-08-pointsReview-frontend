import {
  formatPoints,
  isPointsIncrement,
  parsePoints,
  sumPoints,
} from './points'

describe('point helpers', () => {
  it('converts two-decimal wire values to integer minor units', () => {
    expect(parsePoints('10.00')).toBe(1000)
    expect(parsePoints('0.50')).toBe(50)
    expect(parsePoints('1.5')).toBeNull()
    expect(parsePoints('-0.50')).toBeNull()
  })

  it('formats integer minor units without floating point math', () => {
    expect(formatPoints(0)).toBe('0.00')
    expect(formatPoints(125)).toBe('1.25')
    expect(() => formatPoints(-1)).toThrow(RangeError)
  })

  it('sums and validates increments in minor units', () => {
    expect(sumPoints(['0.50', '1.00', '1.50'])).toBe(300)
    expect(sumPoints(['0.50', 'invalid'])).toBeNull()
    expect(isPointsIncrement('1.50', '0.50')).toBe(true)
    expect(isPointsIncrement('1.25', '0.50')).toBe(false)
  })
})
