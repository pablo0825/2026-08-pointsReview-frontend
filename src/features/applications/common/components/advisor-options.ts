export const advisorTitleLabels: Record<number, string> = {
  1: '專任講師',
  2: '專任助理教授',
  3: '專任助理教授級專業技術人員',
  4: '專任副教授',
  5: '專任副教授級專業技術人員',
  6: '專任教授',
  7: '特聘教授',
}

export function getAdvisorTitle(titleCode: number) {
  return advisorTitleLabels[titleCode] ?? '未知職稱'
}
