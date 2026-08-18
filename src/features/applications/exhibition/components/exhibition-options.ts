import type {
  ExhibitionAttachmentType,
  ExhibitionName,
  ExhibitionType,
} from '../api/exhibition-application.schema'

export const exhibitionTypeLabels: Readonly<Record<ExhibitionType, string>> = {
  fan_work: '同人作品',
  project_work: '專題作品',
}

export const exhibitionNameOptions = [
  ['campus_exhibition', '校內展'],
  ['young_designers_exhibition', '青春設計節'],
  ['vision_get_wild', '放視大賞'],
  ['young_designers_exhibition_taiwan', '新一代設計展'],
  ['a_plus_creative_festival', 'A+ 創意季'],
  ['moe_project_competition', '教育部專題競賽'],
  ['other', '其他'],
] as const satisfies readonly (readonly [ExhibitionName, string])[]

export const exhibitionAttachmentTypes = [
  ['exhibition_photo', '展覽照片'],
  ['exhibition_poster', '展覽海報'],
  ['official_document', '官方文件'],
  ['other', '其他'],
] as const satisfies readonly (readonly [ExhibitionAttachmentType, string])[]

export function getExhibitionNameLabel(value: ExhibitionName) {
  return exhibitionNameOptions.find(([key]) => key === value)?.[1] ?? value
}
