// «הקובץ» של מסמך לדוגמה (F7). בשלב 6 אין קבצים אמיתיים, ולכן מציירים דף פשוט מנתוני המכשיר.
// הצבעים והגופן נקראים ממשתני ה־CSS, כדי שלא יהיו ערכים קשיחים. בשלב 8: קישור זמני ל־Storage (NFR-7).

const PAGE_WIDTH = 900
const PAGE_HEIGHT = 1200
const MARGIN = 72

function cssValue(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

/** מחזיר תמונת PNG (data URL): כותרת ושורות, מימין לשמאל */
export function renderDocumentImage({ title, lines }) {
  const canvas = document.createElement('canvas')
  canvas.width = PAGE_WIDTH
  canvas.height = PAGE_HEIGHT
  const context = canvas.getContext('2d')
  const font = cssValue('--font-family-base')

  context.fillStyle = cssValue('--color-surface-container-lowest')
  context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)

  context.direction = 'rtl'
  context.textAlign = 'right'
  context.fillStyle = cssValue('--color-on-surface')
  context.font = `700 56px ${font}`
  context.fillText(title, PAGE_WIDTH - MARGIN, MARGIN * 2)

  context.strokeStyle = cssValue('--color-outline-variant')
  context.lineWidth = 2
  context.font = `400 36px ${font}`

  lines.forEach((line, index) => {
    const y = MARGIN * 3.5 + index * 96
    context.fillStyle = cssValue('--color-on-surface-variant')
    context.fillText(line, PAGE_WIDTH - MARGIN, y)
    context.beginPath()
    context.moveTo(MARGIN, y + 32)
    context.lineTo(PAGE_WIDTH - MARGIN, y + 32)
    context.stroke()
  })

  return canvas.toDataURL('image/png')
}

/** data URL → קובץ, לשיתוף דרך מערכת ההפעלה */
export async function dataUrlToFile(dataUrl, fileName) {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], fileName, { type: blob.type })
}
