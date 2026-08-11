const TAIPEI_TIME_ZONE = 'Asia/Taipei'

function getTaipeiDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAIPEI_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  )

  return {
    year: values.year,
    month: values.month,
    day: values.day,
  }
}

export function getTaiwanAcademicYear(date = new Date()) {
  const { year, month, day } = getTaipeiDateParts(date)
  const hasStartedNewAcademicYear = month > 8 || (month === 8 && day >= 1)

  return String(year - (hasStartedNewAcademicYear ? 1911 : 1912))
}
