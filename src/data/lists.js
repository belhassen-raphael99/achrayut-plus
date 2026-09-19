// הרשימות הקבועות (PRD §5.6). בשלב 8 הן נאכפות גם בשרת.

/*
 * 19/09/2026 (רפאל): כל קנייה עם אחריות, לא רק מכשירי חשמל. תשע הקטגוריות הראשונות לא השתנו,
 * כדי שנתונים קיימים יישארו תקינים; «אחר» נשאר אחרון.
 */
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
  { id: 'home-systems', label: 'דוד ומערכות בבית', icon: 'water_heater' },
  { id: 'furniture', label: 'רהיטים ומזרנים', icon: 'chair' },
  { id: 'car', label: 'רכב ואופנוע', icon: 'directions_car' },
  { id: 'e-mobility', label: 'אופניים וקורקינטים', icon: 'electric_bike' },
  { id: 'camera', label: 'מצלמות וציוד צילום', icon: 'photo_camera' },
  { id: 'tools', label: 'כלי עבודה וגינה', icon: 'handyman' },
  { id: 'baby', label: 'ציוד לתינוקות', icon: 'stroller' },
  { id: 'sport', label: 'ספורט וכושר', icon: 'fitness_center' },
  { id: 'other', label: 'אחר', icon: 'category' },
]

/** המיקום של המוצר (בממשק: «מיקום»; בקוד: room) */
export const ROOMS = [
  { id: 'kitchen', label: 'מטבח' },
  { id: 'living', label: 'סלון' },
  { id: 'bedroom', label: 'חדר שינה' },
  { id: 'laundry-room', label: 'חדר כביסה' },
  { id: 'bathroom', label: 'חדר רחצה' },
  { id: 'office', label: 'משרד' },
  // 19/09: מיקומים מחוץ לבית, בשביל רכב, אופניים וכלי גינה
  { id: 'kids-room', label: 'חדר ילדים' },
  { id: 'outdoor', label: 'מרפסת וחצר' },
  { id: 'parking', label: 'חניה' },
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
  { id: 'family', label: 'משפחה ובית', description: 'לכל מה שקניתם לבית', icon: 'home' },
  { id: 'business', label: 'עסק או כמה דירות', description: 'לנכסים, לציוד מקצועי או לדירות להשכרה', icon: 'work' },
]

export const ROLES = [
  { id: 'full', label: 'גישה מלאה', description: 'הוספה, עריכה ומחיקה של מוצרים.' },
  { id: 'viewer', label: 'צפייה בלבד', description: 'צפייה במוצרים, במסמכים ובאנשי הקשר.' },
]

/**
 * התוכניות (PRD §6): מכסת סריקות בחודש, וכמה חברים אפשר להזמין לכל מרחב (invitees: null = בלי הגבלה).
 * בתוכנית חינם: מוזמן אחד, בצפייה בלבד (FR-1.5).
 */
/**
 * מגבלות התוכניות (PRD §6). null = ללא הגבלה. rank: הסדר מהקטנה לגדולה (מעבר לתוכנית קטנה, FR-6.2).
 * המחירים והטקסטים של עמוד התמחור נמצאים ב־site.js.
 */
export const PLANS = [
  { id: 'free', label: 'חינם', rank: 0, scans: 5, invitees: 1, viewerOnly: true, properties: 1, serviceMessage: false },
  { id: 'pro', label: 'פרו', rank: 1, scans: 40, invitees: null, viewerOnly: false, properties: 3, serviceMessage: true },
  {
    id: 'manager',
    label: 'פרו לניהול נכסים',
    rank: 2,
    scans: 100,
    invitees: null,
    viewerOnly: false,
    properties: 10,
    serviceMessage: true,
  },
]

/**
 * הדומיין של כתובות העברת החשבוניות (FR-9.1). example.com שמור לדוגמאות: הדומיין האמיתי נקבע בשלב 8.
 */
export const FORWARDING_DOMAIN = 'invoices.example.com'

/** משך אחריות משוער ב־V1: 12 חודשים לכל הקטגוריות (PRD FR-2.9). מחוץ לתקנות (רהיטים, רכב…) זו הערכה בלבד */
export const ESTIMATED_WARRANTY_MONTHS = 12

/** מחזיר את הפריט עם ה־id, או undefined */
export function findById(list, id) {
  return list.find((item) => item.id === id)
}
