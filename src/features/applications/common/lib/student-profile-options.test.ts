import {
  classNumberOptions,
  getClassNumberLabel,
  getGradeLabel,
  gradeOptions,
} from './student-profile-options'

describe('student profile options', () => {
  it('keeps numeric grade codes while exposing their official labels', () => {
    expect(gradeOptions).toEqual([
      [1, '大一'],
      [2, '大二'],
      [3, '大三'],
      [4, '大四'],
      [5, '碩一'],
      [6, '碩二'],
    ])
    expect(getGradeLabel(3)).toBe('大三')
    expect(getGradeLabel(99)).toBe('未知年級')
  })

  it('keeps numeric class codes while exposing their official labels', () => {
    expect(classNumberOptions).toEqual([
      [1, '甲班'],
      [2, '乙班'],
      [3, '丙班'],
      [4, '丁班'],
      [5, '戊班'],
    ])
    expect(getClassNumberLabel(1)).toBe('甲班')
    expect(getClassNumberLabel(99)).toBe('未知班級')
  })
})
