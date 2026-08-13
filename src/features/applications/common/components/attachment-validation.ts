const maximumFileSize = 5 * 1024 * 1024
const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']
const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png']

function fileExtension(file: File) {
  return file.name.split('.').pop()?.toLowerCase() ?? ''
}

export function validateAttachmentFile(file: File) {
  if (!allowedExtensions.includes(fileExtension(file))) {
    return '只接受 PDF、JPEG 或 PNG 檔案。'
  }
  if (!allowedMimeTypes.includes(file.type)) {
    return '檔案格式與瀏覽器辨識的類型不符。'
  }
  if (file.size > maximumFileSize) {
    return '每個附件不得超過 5 MB。'
  }
  return null
}
