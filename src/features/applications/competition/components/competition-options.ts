import type { AttachmentTypeOption } from '../../common/components/attachment-editor'
import type {
  AttachmentType,
  Award,
  CompetitionLevel,
} from '../api/competition-application.schema'

export const competitionLevelLabels: Record<CompetitionLevel, string> = {
  international_integrated: '國際性整合型競賽',
  international_non_integrated: '國際性非整合型競賽',
  national_integrated: '全國性整合型競賽',
  national_non_integrated: '全國性非整合型競賽',
  other: '其他',
}

export const awardLabels: Record<Award, string> = {
  participation: '參賽',
  finalist: '入圍',
  honorable_mention: '佳作',
  third_place: '第三名',
  second_place: '第二名',
  first_place: '第一名',
}

export const competitionAttachmentTypes = [
  ['competition_rules', '競賽辦法'],
  ['competition_poster', '競賽海報'],
  ['official_website_screenshot', '官網截圖'],
  ['official_document', '公文'],
  ['participation_proof', '參賽證明'],
  ['finalist_or_award_certificate', '入圍或獎狀'],
  ['other', '其他'],
] as const satisfies readonly AttachmentTypeOption<AttachmentType>[]
