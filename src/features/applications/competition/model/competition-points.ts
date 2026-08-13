import { formatPoints, parsePoints, sumPoints } from '../../common/lib/points'
import type { CompetitionPointOption } from '../api/competition-application.schema'

export type PointParticipant = {
  requestedPoints: string
}

export function pointOptionKey(
  option: Pick<CompetitionPointOption, 'competitionLevel' | 'award'>,
) {
  return `${option.competitionLevel}:${option.award}`
}

export function buildPointOptionLookup(options: readonly CompetitionPointOption[]) {
  return new Map(options.map((option) => [pointOptionKey(option), option]))
}

export function resetParticipantPoints<T extends PointParticipant>(
  participants: readonly T[],
  option: CompetitionPointOption,
): T[] {
  if (option.allocationMethod === 'per_person') {
    return participants.map((participant) => ({
      ...participant,
      requestedPoints: option.points,
    }))
  }

  return participants.map((participant) => ({
    ...participant,
    requestedPoints: '0.00',
  }))
}

export function getSharedAllocation(
  values: readonly string[],
  option: CompetitionPointOption,
) {
  const total = parsePoints(option.points)
  const allocated = sumPoints(values)
  if (total === null || allocated === null) {
    return { allocated: null, remaining: null, isBalanced: false }
  }

  return {
    allocated: formatPoints(allocated),
    remaining: formatPoints(Math.max(total - allocated, 0)),
    isBalanced: allocated === total,
  }
}

export function getCompetitionParticipantLimit(option: CompetitionPointOption) {
  if (option.allocationMethod === 'per_person') {
    return 10
  }
  const total = parsePoints(option.points)
  const minimum = parsePoints(option.minimumPointsPerParticipant)
  if (total === null || minimum === null || minimum <= 0) {
    return 1
  }
  return Math.min(10, Math.floor(total / minimum))
}
