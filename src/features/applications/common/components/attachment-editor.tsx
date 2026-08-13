import { useEffect, useMemo, useRef } from 'react'

import type { AttachmentType } from '../../competition/api/competition-application.schema'
import { validateAttachmentFile } from './attachment-validation'

export type AttachmentEditorValue = {
  clientFileKey: string
  file: File
  attachmentType: AttachmentType
  attachmentTypeOther: string | null
  description: string | null
}

type AttachmentEditorProps = {
  attachments: readonly AttachmentEditorValue[]
  onChange: (attachments: AttachmentEditorValue[]) => void
  onError: (message: string | null) => void
}

const attachmentTypes = [
  ['competition_rules', '競賽辦法'],
  ['competition_poster', '競賽海報'],
  ['official_website_screenshot', '官網截圖'],
  ['official_document', '公文'],
  ['participation_proof', '參賽證明'],
  ['finalist_or_award_certificate', '入圍或獎狀'],
  ['other', '其他'],
] as const satisfies readonly (readonly [AttachmentType, string])[]

function AttachmentPreview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])

  useEffect(() => {
    return () => URL.revokeObjectURL(url)
  }, [url])

  if (file.type.startsWith('image/')) {
    return (
      <img
        alt={`${file.name} 預覽`}
        className="h-24 w-24 rounded-lg border border-slate-200 object-cover"
        src={url}
      />
    )
  }

  return (
    <a
      className="font-semibold text-blue-800 underline"
      href={url}
      rel="noopener noreferrer"
      target="_blank"
    >
      在新分頁檢視 PDF
    </a>
  )
}

export function AttachmentEditor({
  attachments,
  onChange,
  onError,
}: AttachmentEditorProps) {
  const addInputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    const next = [...attachments]

    for (const file of Array.from(files)) {
      if (next.length >= 10) {
        onError('每份申請最多 10 個附件。')
        break
      }
      const validationError = validateAttachmentFile(file)
      if (validationError) {
        onError(validationError)
        continue
      }
      const duplicate = next.some(
        (attachment) =>
          attachment.file.name === file.name &&
          attachment.file.size === file.size &&
          attachment.file.lastModified === file.lastModified,
      )
      if (
        duplicate &&
        !window.confirm('這個檔案可能已加入。仍要再次加入嗎？')
      ) {
        continue
      }
      next.push({
        clientFileKey: crypto.randomUUID(),
        file,
        attachmentType: 'participation_proof',
        attachmentTypeOther: null,
        description: null,
      })
    }

    onChange(next)
    if (next.length !== attachments.length) onError(null)
    if (addInputRef.current) addInputRef.current.value = ''
  }

  function updateAttachment(
    index: number,
    patch: Partial<AttachmentEditorValue>,
  ) {
    onChange(
      attachments.map((attachment, currentIndex) =>
        currentIndex === index ? { ...attachment, ...patch } : attachment,
      ),
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="font-bold" htmlFor="competition-attachments">
          新增附件
        </label>
        <input
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          className="block min-h-11 w-full rounded-lg border border-slate-300 p-2"
          data-field-path="attachments"
          id="competition-attachments"
          multiple
          onChange={(event) => addFiles(event.target.files)}
          ref={addInputRef}
          type="file"
        />
        <p className="text-sm text-slate-600">
          PDF、JPEG、PNG；每檔最多 5 MB，每份申請最多 10 檔。
        </p>
      </div>

      {attachments.map((attachment, index) => (
        <fieldset
          className="space-y-4 rounded-xl border border-slate-200 p-4"
          key={attachment.clientFileKey}
        >
          <legend className="px-2 font-bold">附件 {index + 1}</legend>
          <p className="break-all font-semibold">{attachment.file.name}</p>
          <p className="text-sm text-slate-600">
            {(attachment.file.size / 1024).toFixed(1)} KB
          </p>
          <AttachmentPreview file={attachment.file} />
          <label className="block space-y-1 font-semibold">
            附件分類
            <select
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
              data-field-path={`attachments.${index}.attachmentType`}
              onChange={(event) => {
                const attachmentType = event.target.value as AttachmentType
                updateAttachment(index, {
                  attachmentType,
                  attachmentTypeOther:
                    attachmentType === 'other'
                      ? attachment.attachmentTypeOther
                      : null,
                })
              }}
              value={attachment.attachmentType}
            >
              {attachmentTypes.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          {attachment.attachmentType === 'other' ? (
            <label className="block space-y-1 font-semibold">
              其他附件類型
              <input
                className="min-h-11 w-full rounded-lg border border-slate-300 px-3"
                data-field-path={`attachments.${index}.attachmentTypeOther`}
                maxLength={100}
                onChange={(event) =>
                  updateAttachment(index, {
                    attachmentTypeOther: event.target.value,
                  })
                }
                value={attachment.attachmentTypeOther ?? ''}
              />
            </label>
          ) : null}
          <label className="block space-y-1 font-semibold">
            說明（選填）
            <textarea
              className="min-h-24 w-full rounded-lg border border-slate-300 p-3"
              maxLength={500}
              onChange={(event) =>
                updateAttachment(index, { description: event.target.value })
              }
              value={attachment.description ?? ''}
            />
          </label>
          <label className="block space-y-1 font-semibold">
            替換檔案
            <input
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="block min-h-11 w-full rounded-lg border border-slate-300 p-2"
              onChange={(event) => {
                const replacement = event.target.files?.[0]
                if (!replacement) return
                const validationError = validateAttachmentFile(replacement)
                if (validationError) {
                  onError(validationError)
                  event.target.value = ''
                  return
                }
                updateAttachment(index, {
                  clientFileKey: crypto.randomUUID(),
                  file: replacement,
                })
                onError(null)
              }}
              type="file"
            />
          </label>
          <button
            className="min-h-11 rounded-lg border border-red-300 px-4 py-2 font-bold text-red-800"
            onClick={() =>
              onChange(attachments.filter((_, current) => current !== index))
            }
            type="button"
          >
            移除附件
          </button>
        </fieldset>
      ))}
    </div>
  )
}
