// העוזר לקריאה בלבד (PRD FR-10). בשלב 6 התשובות נבנות כאן מנתוני המרחב; בשלב 8 Claude עונה
// מאותם נתונים בלבד, בלי כלים שכותבים. מה שלא נמצא במידע → «אין לי את המידע הזה במרחב.»

import { CATEGORIES, CONTACT_TYPES, DATE_SOURCES, findById } from '../data/lists.js'
import { dateSource } from './applianceList.js'
import { formatDate } from './format.js'
import { applianceCountLabel } from './text.js'
import { compareByUrgency } from './applianceList.js'
import { summarizeWarranties, warrantyStatus } from './warranty.js'

export const ASSISTANT_SUGGESTIONS = ['מה מסתיים בקרוב?', 'למי מתקשרים כשמשהו מתקלקל?', 'לאילו מכשירים אין חשבונית?']

export const NO_INFO = 'אין לי את המידע הזה במרחב.'
export const READ_ONLY = 'אני רק עונה על שאלות. אפשר לשנות את זה בכרטיס המכשיר.'

// כמה מכשירים לכל היותר ברשימה אחת בתשובה
const LIST_LIMIT = 8
// מילים שלא מזהות מכשיר
const STOP_WORDS = new Set(['של', 'על', 'את', 'עם', 'מה', 'מי', 'איפה', 'מתי', 'כמה', 'יש', 'אין', 'לי', 'שלי', 'אחריות', 'מכשיר', 'מכשירים'])

const INTENTS = {
  change: /(תוסיף|להוסיף|הוסף|תמחק|למחוק|מחק|תשנה|לשנות|שנה|תעדכן|לעדכן|עדכן|תערוך|לערוך)/,
  legal: /(לתבוע|תביעה|עורך דין|עו"ד|חוק|זכויות)/,
  soon: /(בקרוב|מסתיימ|יסתיימ|נגמר|ייגמר)/,
  expired: /(הסתיימ|נגמרה|פגה|כבר לא באחריות)/,
  contact: /(למי|להתקשר|מתקשרים|טלפון|שירות|תקלה|מתקלקל|טכנאי|איש קשר|אנשי קשר)/,
  document: /(חשבונית|חשבוניות|מסמך|מסמכים|תעודה|קבלה)/,
  missing: /(אין|בלי|חסר|חסרה|חסרות)/,
  warranty: /(עד מתי|מתי|אחריות|באחריות|מוגן|מוגנת)/,
  count: /(כמה)/,
}

function words(text) {
  return text
    .toLocaleLowerCase('he')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 2 && !STOP_WORDS.has(word))
}

// אותיות שימוש שנצמדות לתחילת מילה: «המקרר», «למכונת», «שהתנור»
const PREFIX_LETTERS = 'והבלמשכ'

/** המילים בשאלה, כל אחת גם בלי אות שימוש אחת או שתיים בתחילתה («המקרר» → «מקרר») */
function questionWords(question) {
  const variants = new Set()
  for (const word of words(question)) {
    variants.add(word)
    let rest = word
    for (let i = 0; i < 2 && PREFIX_LETTERS.includes(rest[0]) && rest.length > 3; i += 1) {
      rest = rest.slice(1)
      variants.add(rest)
    }
  }
  return variants
}

/**
 * המכשירים שהשאלה מזכירה. מילה מהשם או מהמותג שווה 2, מילה מהקטגוריה 1,
 * כדי ש«מכונת הכביסה» תמצא את מכונת הכביסה ולא גם את המייבש. הכי הרבה נקודות מנצח
 */
function mentionedAppliances(question, appliances) {
  const asked = questionWords(question)
  const hits = (text) => words(text).filter((word) => asked.has(word)).length
  let best = 0
  let found = []
  for (const appliance of appliances) {
    const score =
      2 * hits(`${appliance.name} ${appliance.brand ?? ''}`) + hits(findById(CATEGORIES, appliance.category)?.label ?? '')
    if (score === 0) continue
    if (score > best) {
      best = score
      found = [appliance]
    } else if (score === best) {
      found.push(appliance)
    }
  }
  return found
}

/** «מזגן · הרצל 12» כשיש כמה נכסים */
function title(appliance, placeOf) {
  const place = placeOf(appliance)
  return place ? `${appliance.name} · ${place}` : appliance.name
}

function statusSentence(appliance, placeOf) {
  const status = warrantyStatus(appliance)
  const name = title(appliance, placeOf)
  if (!status.end) return `תאריך סיום האחריות של ${name} לא ידוע.`
  const origin = status.estimated ? 'משוער' : findById(DATE_SOURCES, dateSource(appliance))?.label
  const suffix = origin ? ` (${origin})` : ''
  if (status.stage === 'expired') return `האחריות על ${name} הסתיימה ב־${formatDate(status.end)}${suffix}.`
  return `האחריות על ${name} בתוקף עד ${formatDate(status.end)}${suffix}, ${status.text.replace(' · משוער', '')}.`
}

function bulletList(items, line) {
  const shown = items.slice(0, LIST_LIMIT).map((item) => `• ${line(item)}`)
  if (items.length > LIST_LIMIT) shown.push(`ועוד ${applianceCountLabel(items.length - LIST_LIMIT)}`)
  return shown.join('\n')
}

// טלפון ואימייל בתוך בידוד משמאל לימין (LRI…PDI), כדי שהפסיק לא יקפוץ לצד השני בבועה בעברית
const ltr = (value) => `\u2066${value}\u2069`

function contactLine(contact) {
  const type = findById(CONTACT_TYPES, contact.type)?.label
  const reach = [contact.phone, contact.email].filter(Boolean).map(ltr).join(', ')
  return `${type}: ${contact.name}${reach ? `, ${reach}` : ''}${contact.primary ? ' (ראשי)' : ''}`
}

/**
 * תשובה לשאלה, רק מהמכשירים שמועברים (המרחב הפעיל והנכס שנבחר).
 * מחזיר { text, links: [appliance] } — הקישורים מובילים לכרטיסי המכשירים שמוזכרים.
 * placeOf(appliance) → שם הנכס, או מחרוזת ריקה כשיש נכס אחד.
 */
export function answerQuestion(question, appliances, placeOf = () => '') {
  const mentioned = mentionedAppliances(question, appliances)
  const has = (intent) => INTENTS[intent].test(question)
  const withStatus = appliances.map((appliance) => ({ appliance, status: warrantyStatus(appliance) }))

  if (has('change')) return { text: READ_ONLY, links: mentioned.slice(0, 1) }
  if (has('legal')) return { text: NO_INFO, links: [] }

  // מכשיר מסוים
  if (mentioned.length > 0 && mentioned.length <= 3) {
    if (has('contact')) {
      return {
        text: mentioned
          .map((appliance) =>
            appliance.contacts.length
              ? `${title(appliance, placeOf)}:\n${appliance.contacts.map((contact) => `• ${contactLine(contact)}`).join('\n')}`
              : `אין אנשי קשר בכרטיס של ${title(appliance, placeOf)}.`,
          )
          .join('\n\n'),
        links: mentioned,
      }
    }
    if (has('document')) {
      return {
        text: mentioned
          .map((appliance) =>
            appliance.documents.some((item) => item.type === 'invoice')
              ? `החשבונית של ${title(appliance, placeOf)} נמצאת בכרטיס שלו.`
              : `אין חשבונית בכרטיס של ${title(appliance, placeOf)}.`,
          )
          .join('\n'),
        links: mentioned,
      }
    }
    return { text: mentioned.map((appliance) => statusSentence(appliance, placeOf)).join('\n'), links: mentioned }
  }

  if (has('document') && has('missing')) {
    const without = appliances.filter((appliance) => !appliance.documents.some((item) => item.type === 'invoice'))
    if (without.length === 0) return { text: 'לכל המכשירים יש חשבונית.', links: [] }
    return {
      text: `ל־${applianceCountLabel(without.length)} אין חשבונית:\n${bulletList(without, (appliance) => title(appliance, placeOf))}`,
      links: without.slice(0, LIST_LIMIT),
    }
  }

  if (has('expired') && !has('soon')) {
    const ended = withStatus.filter((item) => item.status.stage === 'expired').sort(compareByUrgency)
    if (ended.length === 0) return { text: 'אין מכשירים שהאחריות שלהם הסתיימה.', links: [] }
    return {
      text: `האחריות הסתיימה על ${applianceCountLabel(ended.length)}:\n${bulletList(ended, ({ appliance, status }) => `${title(appliance, placeOf)}, ב־${formatDate(status.end)}`)}`,
      links: ended.slice(0, LIST_LIMIT).map((item) => item.appliance),
    }
  }

  if (has('soon')) {
    const soon = withStatus.filter((item) => item.status.stage === 'soon').sort(compareByUrgency)
    if (soon.length === 0) return { text: 'אין מכשירים שהאחריות שלהם מסתיימת ב־90 הימים הקרובים.', links: [] }
    return {
      text: `ב־90 הימים הקרובים מסתיימת האחריות על ${applianceCountLabel(soon.length)}:\n${bulletList(soon, ({ appliance, status }) => `${title(appliance, placeOf)}: ${status.text}, עד ${formatDate(status.end)}`)}`,
      links: soon.slice(0, LIST_LIMIT).map((item) => item.appliance),
    }
  }

  if (has('contact')) {
    const withContact = appliances
      .map((appliance) => ({ appliance, contact: appliance.contacts.find((item) => item.primary) ?? appliance.contacts[0] }))
      .filter((item) => item.contact)
    const missing = appliances.length - withContact.length
    if (withContact.length === 0) return { text: 'אין עדיין אנשי קשר באף מכשיר.', links: [] }
    const lines = bulletList(withContact, ({ appliance, contact }) => `${title(appliance, placeOf)}: ${contact.name}${contact.phone ? `, ${ltr(contact.phone)}` : ''}`)
    const note = missing > 0 ? `\nל־${applianceCountLabel(missing)} אין עדיין איש קשר.` : ''
    return {
      text: `לכל מכשיר יש אנשי קשר משלו. אלה הראשיים:\n${lines}${note}`,
      links: withContact.slice(0, LIST_LIMIT).map((item) => item.appliance),
    }
  }

  if (has('count') || (has('warranty') && mentioned.length === 0)) {
    const { counts, total } = summarizeWarranties(appliances)
    if (total === 0) return { text: 'אין עדיין מכשירים כאן.', links: [] }
    const parts = [
      counts.protected && `${counts.protected} מוגנים`,
      counts.soon && `${counts.soon} מסתיימים בקרוב`,
      counts.expired && `${counts.expired} שהאחריות שלהם הסתיימה`,
      counts.unknown && `${counts.unknown} בתאריך לא ידוע`,
    ].filter(Boolean)
    return { text: `יש כאן ${applianceCountLabel(total)}: ${parts.join(', ')}.`, links: [] }
  }

  return { text: NO_INFO, links: [] }
}
