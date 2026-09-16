// רשימת המכשירים: לשוניות, חיפוש, סינון וסדר (PRD FR-4.5–4.7)

import { ROOMS } from '../data/lists.js'

export const LIST_TABS = [
  { id: 'all', label: 'הכול' },
  { id: 'soon', label: 'מסתיימת בקרוב' },
  { id: 'expired', label: 'הסתיימה' },
  { id: 'unknown', label: 'תאריך לא ידוע' },
]

export const EMPTY_FILTERS = { rooms: [], categories: [], sources: [], year: '' }

/** מקור התאריך שהתו סופר אליו: של האחריות המורחבת אם יש, אחרת של הרגילה */
export function dateSource(appliance) {
  return appliance.extended?.source ?? appliance.warrantySource
}

/** «2025», או מחרוזת ריקה כשאין תאריך רכישה */
export function purchaseYear(appliance) {
  return appliance.purchaseDate?.slice(0, 4) ?? ''
}

/** חיפוש לפי שם, מותג או דגם (FR-4.6), בלי הבדל בין אותיות גדולות וקטנות */
export function matchesQuery(appliance, query) {
  const needle = query.trim().toLocaleLowerCase('he')
  if (!needle) return true
  return [appliance.name, appliance.brand, appliance.model].some((field) =>
    field?.toLocaleLowerCase('he').includes(needle),
  )
}

/** קבוצה ריקה = בלי סינון בקבוצה הזו. בין קבוצות: גם וגם (FR-4.7) */
export function matchesFilters(appliance, filters) {
  if (filters.rooms.length && !filters.rooms.includes(appliance.room)) return false
  if (filters.categories.length && !filters.categories.includes(appliance.category)) return false
  if (filters.sources.length && !filters.sources.includes(dateSource(appliance))) return false
  if (filters.year && purchaseYear(appliance) !== filters.year) return false
  return true
}

/** כמה מסננים פעילים, למספר שעל כפתור «סינון» */
export function countActiveFilters(filters) {
  return filters.rooms.length + filters.categories.length + filters.sources.length + (filters.year ? 1 : 0)
}

/**
 * «מהקרוב לסיום אל הרחוק» (FR-4.5): קודם מה שעדיין בתוקף (הקרוב ביותר ראשון),
 * אחריו מה שהסתיים (מה שהסתיים לאחרונה ראשון), ובסוף תאריך לא ידוע.
 */
export function compareByUrgency(a, b) {
  const rank = (status) => (status.stage === 'unknown' ? 2 : status.days < 0 ? 1 : 0)
  const byRank = rank(a.status) - rank(b.status)
  if (byRank !== 0) return byRank
  if (a.status.stage === 'unknown') return a.appliance.name.localeCompare(b.appliance.name, 'he')
  return a.status.days >= 0 ? a.status.days - b.status.days : b.status.days - a.status.days
}

/** קבוצות לפי חדר, בסדר הרשימה הקבועה; בתוך כל חדר לפי compareByUrgency */
export function groupByRoom(items) {
  return ROOMS.map((room) => ({
    room,
    items: items.filter((item) => item.appliance.room === room.id).sort(compareByUrgency),
  })).filter((group) => group.items.length > 0)
}

const FILTER_PARAMS = { rooms: 'room', categories: 'category', sources: 'source' }

/** המסננים נשמרים בכתובת (?room=kitchen,living), כדי שחזרה מכרטיס מכשיר תשמור עליהם */
export function filtersFromParams(params) {
  const list = (key) => params.get(key)?.split(',').filter(Boolean) ?? []
  return {
    rooms: list(FILTER_PARAMS.rooms),
    categories: list(FILTER_PARAMS.categories),
    sources: list(FILTER_PARAMS.sources),
    year: params.get('year') ?? '',
  }
}

/** { room: 'kitchen,living', category: '', source: '', year: '2025' } — ערך ריק מוחק את הפרמטר */
export function filtersToParams(filters) {
  return {
    [FILTER_PARAMS.rooms]: filters.rooms.join(','),
    [FILTER_PARAMS.categories]: filters.categories.join(','),
    [FILTER_PARAMS.sources]: filters.sources.join(','),
    year: filters.year,
  }
}
