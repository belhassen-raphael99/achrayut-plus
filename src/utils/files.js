// קבצים שמעלים: תמונה או PDF עד 10MB (PRD FR-2.2, FR-3.6). קובץ אחר נדחה עוד בדפדפן, לפני ההעלאה.

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

export function isPdf(file) {
  return file.type === 'application/pdf'
}

export function isAcceptedUpload(file) {
  return (file.type.startsWith('image/') || isPdf(file)) && file.size <= MAX_UPLOAD_BYTES
}

/** «1.2MB» · «640KB» */
export function formatFileSize(bytes) {
  const megabytes = bytes / (1024 * 1024)
  if (megabytes >= 1) return `${megabytes.toFixed(1)}MB`
  return `${Math.max(1, Math.round(bytes / 1024))}KB`
}
