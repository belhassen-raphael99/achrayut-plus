// תאריכים בלי שעה, לפי שעון מקומי.
// הנתונים שומרים תאריך כמחרוזת YYYY-MM-DD (כמו עמודת date ב־Postgres בשלב 8).

const MS_PER_DAY = 24 * 60 * 60 * 1000

/** היום, בחצות */
export function today() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Date → «2026-10-12» */
export function toISODate(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** «2026-10-12» → Date בחצות. ערך ריק → null */
export function parseISODate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** מוסיף חודשים בלי לגלוש: 31/01 + חודש = היום האחרון של פברואר */
export function addMonths(date, months) {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(date.getDate(), lastDay))
  return target
}

/** ימים מ־from עד to (שלילי כש־to כבר עבר). לא מושפע ממעבר לשעון קיץ */
export function daysBetween(from, to) {
  const utcFrom = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())
  const utcTo = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((utcTo - utcFrom) / MS_PER_DAY)
}

/** חודשים שלמים מ־from עד to (from מוקדם מ־to) */
export function monthsBetween(from, to) {
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth())
  if (to.getDate() < from.getDate()) months -= 1
  return Math.max(0, months)
}
