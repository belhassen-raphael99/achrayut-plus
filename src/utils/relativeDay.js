import { daysBetween, today } from './dates.js'
import { formatDate } from './format.js'

/** כמה ימים עברו מאז (0 = היום) */
export function daysAgo(isoDateTime) {
  const date = new Date(isoDateTime)
  return daysBetween(new Date(date.getFullYear(), date.getMonth(), date.getDate()), today())
}

/** זמן ההתראה (T1): «היום» · «אתמול» · «לפני 3 ימים» · ומשבוע ומעלה התאריך */
export function relativeDayLabel(isoDateTime) {
  const days = daysAgo(isoDateTime)
  if (days <= 0) return 'היום'
  if (days === 1) return 'אתמול'
  if (days < 7) return `לפני ${days} ימים`
  return formatDate(new Date(isoDateTime))
}
