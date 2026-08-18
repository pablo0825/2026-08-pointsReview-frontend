import type { ExhibitionPointOption, ExhibitionType } from '../api/exhibition-application.schema'

export function buildExhibitionPointOptionLookup(options: readonly ExhibitionPointOption[]) {
  return new Map(options.map((option) => [option.exhibitionType, option.allowedPointsPerPerson] as const))
}

export function isAllowedExhibitionPoint(
  lookup: ReadonlyMap<ExhibitionType, readonly string[]>,
  exhibitionType: ExhibitionType,
  points: string,
) {
  return lookup.get(exhibitionType)?.includes(points) ?? false
}

export function clearExhibitionParticipantPoints<T extends { requestedPoints: string }>(
  participants: readonly T[],
) {
  return participants.map((participant) => ({ ...participant, requestedPoints: '' }))
}
