export const gradeOptions = [
  [1, '大一'],
  [2, '大二'],
  [3, '大三'],
  [4, '大四'],
  [5, '碩一'],
  [6, '碩二'],
] as const

export const classNumberOptions = [
  [1, '甲班'],
  [2, '乙班'],
  [3, '丙班'],
  [4, '丁班'],
  [5, '戊班'],
] as const

export function getGradeLabel(grade: number) {
  return gradeOptions.find(([value]) => value === grade)?.[1] ?? '未知年級'
}

export function getClassNumberLabel(classNumber: number) {
  return classNumberOptions.find(([value]) => value === classNumber)?.[1] ?? '未知班級'
}
