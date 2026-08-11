import { getTaiwanAcademicYear } from './academic-year'

describe('getTaiwanAcademicYear', () => {
  it('uses July 31 as the final day of the previous Taiwan academic year', () => {
    expect(getTaiwanAcademicYear(new Date('2026-07-31T15:59:59Z'))).toBe('114')
  })

  it('changes academic year at August 1 midnight in Asia/Taipei', () => {
    expect(getTaiwanAcademicYear(new Date('2026-07-31T16:00:00Z'))).toBe('115')
  })

  it('is independent of the runtime local timezone', () => {
    expect(getTaiwanAcademicYear(new Date('2027-01-15T00:00:00Z'))).toBe('115')
  })
})
