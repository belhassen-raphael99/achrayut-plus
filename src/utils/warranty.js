import { addMonths, daysBetween, monthsBetween, parseISODate, today } from './dates.js'

// שלבי האחריות (PRD FR-3.2, §5.6 · DESIGN.md §6, §11)
export const SOON_THRESHOLD_DAYS = 90

export const STAGE_LABELS = {
  protected: 'מוגנת',
  soon: 'מסתיימת בקרוב',
  expired: 'הסתיימה',
  unknown: 'תאריך לא ידוע',
}

/** «יום אחד» · «יומיים» · «5 ימים» · «חודש» · «חודשיים» · «3 חודשים» */
export function formatDuration(count, unit) {
  if (unit === 'day') {
    if (count === 1) return 'יום אחד'
    if (count === 2) return 'יומיים'
    return `${count} ימים`
  }
  if (count === 1) return 'חודש'
  if (count === 2) return 'חודשיים'
  return `${count} חודשים`
}

/** היחידה שבחץ של תו האחריות, ליד המספר */
export function unitLabel(count, unit) {
  if (unit === 'day') return count === 1 ? 'יום' : 'ימים'
  return count === 1 ? 'חודש' : 'חודשים'
}

/** סוף האחריות הרגילה: תאריך הרכישה + משך האחריות. בלי תאריך רכישה → null */
export function standardWarrantyEnd(appliance) {
  const purchase = parseISODate(appliance.purchaseDate)
  if (!purchase || !appliance.warrantyMonths) return null
  return addMonths(purchase, appliance.warrantyMonths)
}

/** סוף הכיסוי: סוף האחריות המורחבת אם יש, אחרת סוף הרגילה (FR-3.3) */
export function coverageEnd(appliance) {
  return parseISODate(appliance.extended?.end) ?? standardWarrantyEnd(appliance)
}

/**
 * מצב האחריות של מכשיר.
 * stage: protected · soon · expired · unknown
 * amount + unit: הזמן שנותר או שעבר — בימים עד 90 יום, ובחודשים מעבר לזה
 * text: «עוד 24 ימים» · «הסתיימה לפני 3 חודשים» · «תאריך לא ידוע», ועם «· משוער» כשהמשך מוערך
 */
export function warrantyStatus(appliance, now = today()) {
  const end = coverageEnd(appliance)

  if (!end) {
    return { stage: 'unknown', end: null, days: null, amount: null, unit: null, estimated: false, text: STAGE_LABELS.unknown }
  }

  const days = daysBetween(now, end)
  const distance = Math.abs(days)
  const unit = distance <= SOON_THRESHOLD_DAYS ? 'day' : 'month'
  const amount = unit === 'day' ? distance : days >= 0 ? monthsBetween(now, end) : monthsBetween(end, now)
  const estimated = !appliance.extended && appliance.warrantySource === 'estimated'

  let stage
  let text
  if (days < 0) {
    stage = 'expired'
    text = `הסתיימה לפני ${formatDuration(amount, unit)}`
  } else {
    stage = days <= SOON_THRESHOLD_DAYS ? 'soon' : 'protected'
    text = days === 0 ? 'מסתיימת היום' : `עוד ${formatDuration(amount, unit)}`
  }

  return { stage, end, days, amount, unit, estimated, text: estimated ? `${text} · משוער` : text }
}

/** ספירה לפי שלב, לבלוק הראש של הדשבורד (FR-4.1) */
export function summarizeWarranties(appliances, now = today()) {
  const counts = { protected: 0, soon: 0, expired: 0, unknown: 0 }
  for (const appliance of appliances) {
    counts[warrantyStatus(appliance, now).stage] += 1
  }
  return { counts, total: appliances.length, active: counts.protected + counts.soon }
}

/** שורת הסיכום מתחת לפס המחולק: «2 מסתיימות בקרוב · 1 הסתיימה» (FR-4.1) */
export function warrantySummaryText(counts) {
  const parts = []
  if (counts.soon) parts.push(`${counts.soon} ${counts.soon === 1 ? 'מסתיימת' : 'מסתיימות'} בקרוב`)
  if (counts.expired) parts.push(`${counts.expired} ${counts.expired === 1 ? 'הסתיימה' : 'הסתיימו'}`)
  if (counts.unknown) parts.push(`${counts.unknown} בתאריך לא ידוע`)
  return parts.join(' · ')
}
