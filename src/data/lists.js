// הרשימות הקבועות (PRD §5.6). בשלב 8 הן נאכפות גם בשרת.

export const CATEGORIES = [
  { id: 'fridge', label: 'מקרר', icon: 'kitchen' },
  { id: 'laundry', label: 'מכונת כביסה ומייבש', icon: 'local_laundry_service' },
  { id: 'dishwasher', label: 'מדיח כלים', icon: 'dishwasher_gen' },
  { id: 'oven', label: 'תנור וכיריים', icon: 'oven_gen' },
  { id: 'small-kitchen', label: 'מכשירי מטבח קטנים', icon: 'microwave_gen' },
  { id: 'ac', label: 'מזגן', icon: 'ac_unit' },
  { id: 'tv', label: 'טלוויזיה ושמע', icon: 'tv' },
  { id: 'computer', label: 'מחשב וטלפון', icon: 'devices' },
  { id: 'vacuum', label: 'שואב אבק', icon: 'vacuum' },
  { id: 'other', label: 'אחר', icon: 'category' },
]

export const ROOMS = [
  { id: 'kitchen', label: 'מטבח' },
  { id: 'living', label: 'סלון' },
  { id: 'bedroom', label: 'חדר שינה' },
  { id: 'laundry-room', label: 'חדר כביסה' },
  { id: 'bathroom', label: 'חדר רחצה' },
  { id: 'office', label: 'משרד' },
  { id: 'other', label: 'אחר' },
]

/** short: הצורה הקצרה בשורת איש קשר («יבואן · LG ישראל») */
export const CONTACT_TYPES = [
  { id: 'seller', label: 'מוכר', short: 'מוכר' },
  { id: 'importer', label: 'יבואן או יצרן', short: 'יבואן' },
  { id: 'installer', label: 'מתקין', short: 'מתקין' },
]

export const DOCUMENT_TYPES = [
  { id: 'invoice', label: 'חשבונית' },
  { id: 'warranty', label: 'תעודת אחריות' },
  { id: 'installation', label: 'אישור התקנה' },
  { id: 'other', label: 'אחר' },
]

export const DATE_SOURCES = [
  { id: 'invoice', label: 'מהחשבונית' },
  { id: 'certificate', label: 'מתעודת האחריות' },
  { id: 'manual', label: 'הוזן ידנית' },
  { id: 'estimated', label: 'משוער לפי קטגוריה' },
]

export const SPACE_TYPES = [
  { id: 'family', label: 'משפחה ובית', description: 'למכשירים של הבית', icon: 'home' },
  { id: 'business', label: 'עסק או כמה דירות', description: 'לנכסים, לציוד מקצועי או לדירות להשכרה', icon: 'work' },
]

export const ROLES = [
  { id: 'full', label: 'גישה מלאה', description: 'הוספה, עריכה ומחיקה של מכשירים.' },
  { id: 'viewer', label: 'צפייה בלבד', description: 'צפייה במכשירים, במסמכים ובאנשי הקשר.' },
]

/**
 * התוכניות (PRD §6): מכסת סריקות בחודש, וכמה חברים אפשר להזמין לכל מרחב (invitees: null = בלי הגבלה).
 * בתוכנית חינם: מוזמן אחד, בצפייה בלבד (FR-1.5).
 */
export const PLANS = [
  { id: 'free', label: 'חינם', scans: 5, invitees: 1, viewerOnly: true },
  { id: 'pro', label: 'פרו', scans: 40, invitees: null, viewerOnly: false },
  { id: 'manager', label: 'פרו לניהול נכסים', scans: 100, invitees: null, viewerOnly: false },
]

/** משך אחריות משוער ב־V1: 12 חודשים לכל הקטגוריות (PRD FR-2.9) */
export const ESTIMATED_WARRANTY_MONTHS = 12

/** מחזיר את הפריט עם ה־id, או undefined */
export function findById(list, id) {
  return list.find((item) => item.id === id)
}
