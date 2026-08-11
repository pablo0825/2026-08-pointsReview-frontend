import type {
  PublishedInstructionSectionWire,
  PublishedInstructionsResponse,
} from './published-instructions.schema'

export type PublishedInstructionSection = {
  academicYear: string
  revisionNumber: number
  sectionKey: string
  title: string
  content: string
  displayOrder: number
  effectiveFrom: string
  effectiveTo: string | null
}

function mapSection(
  section: PublishedInstructionSectionWire,
): PublishedInstructionSection {
  return { ...section }
}

export function mapPublishedInstructions(
  response: PublishedInstructionsResponse,
): PublishedInstructionSection[] {
  return response.data.map(mapSection)
}
