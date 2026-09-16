// הודעה לשירות הלקוחות (PRD FR-8.3). בשלב 6 ההודעה נבנית מתבנית; בשלב 8 Claude כותב אותה מאותם נתונים בלבד.

import { DATE_SOURCES, findById } from '../data/lists.js'
import { formatDate } from './format.js'
import { dateSource } from './applianceList.js'
import { warrantyStatus } from './warranty.js'
import { fullName } from './text.js'
import { parseISODate } from './dates.js'

/** פרטי המכשיר כשורות, רק מה שכתוב בכרטיס. משמש גם ל«כתיבה בעצמכם» (FR-8.4) */
export function applianceFacts(appliance) {
  const status = warrantyStatus(appliance)
  const purchase = parseISODate(appliance.purchaseDate)
  const source = findById(DATE_SOURCES, dateSource(appliance))?.label
  const facts = [
    ['מכשיר', appliance.name],
    ['מותג', appliance.brand],
    ['דגם', appliance.model],
    ['מספר סידורי', appliance.serial],
    ['תאריך רכישה', purchase && formatDate(purchase)],
  ]
  // בתאריך לא ידוע אין שורה על האחריות; תאריך משוער נכתב כ«משוער»
  if (status.end) {
    const label = status.stage === 'expired' ? 'האחריות הסתיימה ב־' : 'האחריות בתוקף עד'
    const origin = status.estimated ? 'משוער' : source
    facts.push([label, `${formatDate(status.end)}${origin ? ` (${origin})` : ''}`])
  }
  return facts.filter(([, value]) => Boolean(value))
}

/** «מכשיר: מכונת כביסה LG» — שורה לכל פרט */
export function factsText(appliance, { withName = true } = {}) {
  return applianceFacts(appliance)
    .slice(withName ? 0 : 1)
    .map(([label, value]) => (label.endsWith('־') ? `${label}${value}` : `${label}: ${value}`))
    .join('\n')
}

/**
 * ההודעה המלאה: פנייה, הפרטים, מה קרה, בקשה לבדיקה, חשבונית מצורפת, חתימה.
 * contact = איש הקשר שנבחר, או null (בלי פנייה בשם). user = החותם; טלפון רק אם הוזן בפרופיל.
 */
export function buildServiceMessage({ appliance, contact, issue, user, hasInvoice }) {
  const status = warrantyStatus(appliance)
  const covered = status.stage === 'protected' || status.stage === 'soon'
  const lines = [
    contact ? `שלום ${contact.name},` : 'שלום,',
    '',
    `אני פונה בנוגע ל${appliance.name}.`,
    // שם המכשיר כבר במשפט הפתיחה
    factsText(appliance, { withName: false }),
    '',
    `מה קרה: ${issue.trim()}`,
    '',
    covered ? 'אשמח לתאם בדיקה של טכנאי במסגרת האחריות.' : 'אשמח לתאם בדיקה של טכנאי.',
  ]
  if (hasInvoice) lines.push('מצורפת החשבונית.')
  lines.push('', 'תודה,', fullName(user))
  if (user.phone) lines.push(user.phone)
  return lines.join('\n')
}

/** נושא המייל: «[שם המכשיר] · פנייה בנושא אחריות» */
export function serviceMessageSubject(appliance) {
  return `${appliance.name} · פנייה בנושא אחריות`
}
