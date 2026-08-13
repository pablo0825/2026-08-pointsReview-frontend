import {
  getTaipeiDateString,
  getTaiwanAcademicYear,
} from './academic-year'

describe('Taipei calendar helpers', () => {
  it('uses July 31 as the final day of the previous Taiwan academic year', () => {
    expect(getTaiwanAcademicYear(new Date('2026-07-31T15:59:59Z'))).toBe('114')
  })

  it('changes academic year at August 1 midnight in Asia/Taipei', () => {
    expect(getTaiwanAcademicYear(new Date('2026-07-31T16:00:00Z'))).toBe('115')
  })

  it('formats a stable Taipei date string', () => {
    expect(getTaipeiDateString(new Date('2026-08-12T16:00:00Z'))).toBe(
      '2026-08-13',
    )
  })
})
