// נתוני הדוגמה של שלב 6 (TASK-PLAN.md): בלי שרת. בשלב 7 נגזר מהם ה־ERD, ובשלב 8 הם עוברים ל־Supabase.
//
// התאריכים מחושבים ביחס להיום, כדי שהמצבים יישארו נכונים בכל יום שבו בודקים את האתר:
//   «משפחת לוי»    — 18 מכשירים: 15 מוגנים, 2 מסתיימים בקרוב, 1 הסתיים → 17 / 18 (PRD FR-4.1)
//   «דירות להשכרה» — 19 מכשירים בשלושה נכסים (הרצל 12 · אילת · יפו): 18 מוגנים, ו«תנור» בהרצל 12
//                    בתאריך לא ידוע (F4)
//                    → «אין כרגע משהו לטפל בו» (D3) ומקטע אפור בפס
//
// המשתמשים (הסיסמה בעמוד ההתחברות: Warranty2026):
//   נועה לוי — noa@example.com, יוצרת שני המרחבים, גישה מלאה, «פרו לניהול נכסים» שנתי (FR-6)
//   אייל לוי — eyal@example.com, צפייה בלבד ב«משפחת לוי» (D4)
//   רחל כהן  — new@example.com, בלי מרחב (כניסה ראשונה). הוזמנה ל«משפחת לוי» עם הקוד BLH4K2

import { addDays, addMonths, toISODate, today } from '../utils/dates.js'

// גרסה חדשה מאפסת את הנתונים שנשמרו בסשן (sessionStorage) כשמבנה הדוגמה משתנה
export const DEMO_VERSION = 3
export const DEMO_INVITE_CODE = 'BLH4K2'

function createUsers(now) {
  const reminders = { d90: true, d30: true, d7: true }
  // בחינם אין חיוב ואין תאריך חידוש; cancelAt = מתי מנוי שבוטל מסתיים (FR-6.3)
  const free = { plan: 'free', billing: null, renewsAt: null, cancelAt: null }
  return {
    noa: {
      id: 'noa',
      firstName: 'נועה',
      lastName: 'לוי',
      email: 'noa@example.com',
      phone: '',
      gender: 'female',
      googleConnected: true,
      plan: 'manager',
      billing: 'annual',
      renewsAt: toISODate(addMonths(now, 5)),
      cancelAt: null,
      // 98 מתוך 100: נשארות 2 סריקות, כדי שמסך המכסה (N10) עדיין נבדק
      scansUsed: 98,
      reminders,
    },
    eyal: {
      id: 'eyal',
      firstName: 'אייל',
      lastName: 'לוי',
      email: 'eyal@example.com',
      phone: '',
      gender: 'male',
      googleConnected: false,
      ...free,
      scansUsed: 0,
      reminders,
    },
    rachel: {
      id: 'rachel',
      firstName: 'רחל',
      lastName: 'כהן',
      email: 'new@example.com',
      phone: '',
      gender: 'female',
      googleConnected: false,
      ...free,
      scansUsed: 0,
      reminders,
    },
  }
}

function createSpaces(now) {
  return [
    {
      id: 'levi',
      name: 'משפחת לוי',
      type: 'family',
      ownerId: 'noa',
      // נכס אחד: הממשק לא מזכיר נכסים (FR-7.1)
      properties: [{ id: 'levi-home', name: 'משפחת לוי' }],
      // העברת חשבוניות במייל (FR-9): PDF עם כמה מכשירים שמוכן לבדיקה, ותמונה שלא נקראה
      forwarding: { local: 'levi-7k2q' },
      inbox: [
        {
          id: 'inbox-pdf',
          fileName: 'חשבונית-מחסני-חשמל.pdf',
          senderId: 'noa',
          receivedAt: addDays(now, -1).toISOString(),
          status: 'ready',
          reading: 'pdf',
        },
        {
          id: 'inbox-blurry',
          fileName: 'scan0042.jpg',
          senderId: 'noa',
          receivedAt: addDays(now, -3).toISOString(),
          status: 'unreadable',
          reading: 'invoice',
        },
      ],
      members: [
        { userId: 'noa', role: 'full' },
        { userId: 'eyal', role: 'viewer' },
      ],
      invites: [
        {
          id: 'invite-rachel',
          name: 'רחל כהן',
          role: 'viewer',
          code: DEMO_INVITE_CODE,
          invitedBy: 'noa',
          expiresAt: toISODate(addDays(now, 7)),
        },
      ],
    },
    {
      id: 'rentals',
      name: 'דירות להשכרה',
      type: 'business',
      ownerId: 'noa',
      properties: [
        { id: 'herzl', name: 'הרצל 12' },
        { id: 'eilat', name: 'אילת' },
        { id: 'jaffa', name: 'יפו' },
      ],
      forwarding: { local: 'rentals-m4px' },
      inbox: [],
      members: [{ userId: 'noa', role: 'full' }],
      invites: [],
    },
  ]
}

function contact(id, type, name, details = {}) {
  return { id, type, name, phone: '', email: '', website: '', note: '', primary: false, ...details }
}

function fileRecord(id, type, uploadedAt, sizeBytes) {
  return { id, type, uploadedAt, sizeBytes }
}

/**
 * מכשיר לדוגמה. endIn = בעוד כמה זמן מסתיימת האחריות הרגילה ({ months, days }, שלילי = עבר);
 * תאריך הרכישה נגזר ממנו ומ־warrantyMonths.
 */
function appliance(now, spec) {
  const { endIn, warrantyMonths = 12, addedDaysAgo = 30, ...fields } = spec
  const end = endIn ? addDays(addMonths(now, endIn.months ?? 0), endIn.days ?? 0) : null
  const purchaseDate = end ? toISODate(addMonths(end, -warrantyMonths)) : null

  return {
    brand: '',
    model: '',
    serial: '',
    warrantySource: 'invoice',
    extended: null,
    contacts: [],
    documents: [],
    ...fields,
    purchaseDate,
    warrantyMonths,
    addedAt: addDays(now, -addedDaysAgo).toISOString(),
  }
}

function createLeviAppliances(now) {
  const levi = { spaceId: 'levi', propertyId: 'levi-home' }
  const iso = (months, days = 0) => toISODate(addDays(addMonths(now, months), days))

  return [
    appliance(now, {
      ...levi,
      id: 'lg-washer',
      name: 'מכונת כביסה LG',
      category: 'laundry',
      room: 'laundry-room',
      brand: 'LG',
      model: 'F4WV709S1E',
      serial: '304KWYR88192',
      endIn: { days: 24 },
      addedDaysAgo: 40,
      contacts: [
        contact('lg-washer-importer', 'importer', 'LG ישראל', {
          phone: '1-800-000-000',
          email: 'service@example.com',
          note: 'שירות לקוחות',
          primary: true,
        }),
        contact('lg-washer-seller', 'seller', 'מחסני חשמל', { phone: '09-000-0000', note: 'סניף רעננה' }),
        contact('lg-washer-installer', 'installer', 'אבי', { phone: '050-000-0000', note: 'התקין את המכונה' }),
      ],
      documents: [fileRecord('lg-washer-invoice', 'invoice', iso(-11, 24), 1_200_000)],
    }),
    appliance(now, {
      ...levi,
      id: 'samsung-fridge',
      name: 'מקרר סמסונג',
      category: 'fridge',
      room: 'kitchen',
      brand: 'Samsung',
      model: 'RB38T602DWW',
      serial: 'SM0385520193',
      endIn: { months: 11, days: 10 },
      warrantyMonths: 24,
      addedDaysAgo: 9,
      contacts: [
        contact('fridge-importer', 'importer', 'סמסונג ישראל', { phone: '1-800-000-001', primary: true }),
        contact('fridge-seller', 'seller', 'מחסני חשמל', { phone: '09-000-0000', note: 'סניף רעננה' }),
      ],
      documents: [fileRecord('fridge-invoice', 'invoice', iso(-12, 10), 980_000)],
    }),
    appliance(now, {
      ...levi,
      id: 'bosch-oven',
      name: 'תנור בוש',
      category: 'oven',
      room: 'kitchen',
      brand: 'Bosch',
      model: 'HBG635BS1',
      serial: 'BS4471190028',
      endIn: { months: -3, days: -5 },
      warrantyMonths: 24,
      warrantySource: 'certificate',
      addedDaysAgo: 11,
      contacts: [
        contact('oven-importer', 'importer', 'BSH ישראל', { phone: '1-800-000-002', primary: true }),
        contact('oven-seller', 'seller', 'מחסני חשמל', { phone: '09-000-0000', note: 'סניף רעננה' }),
      ],
      documents: [fileRecord('oven-certificate', 'warranty', iso(-27, -5), 640_000)],
    }),
    appliance(now, {
      ...levi,
      id: 'lg-microwave',
      name: 'מיקרוגל LG',
      category: 'small-kitchen',
      room: 'kitchen',
      brand: 'LG',
      model: 'MS23',
      endIn: { months: 5, days: 10 },
      warrantySource: 'estimated',
      addedDaysAgo: 13,
      contacts: [contact('microwave-seller', 'seller', 'מחסני חשמל', { phone: '09-000-0000', primary: true })],
    }),
    appliance(now, {
      ...levi,
      id: 'salon-ac',
      name: 'מזגן סלון',
      category: 'ac',
      room: 'living',
      brand: 'תדיראן',
      model: 'Alpha Pro 140',
      endIn: { days: 61 },
      warrantyMonths: 36,
      addedDaysAgo: 10,
      contacts: [
        contact('ac-installer', 'installer', 'אבי', { phone: '050-000-0000', primary: true }),
        contact('ac-importer', 'importer', 'תדיראן', { phone: '1-800-000-003' }),
      ],
      documents: [fileRecord('ac-invoice', 'invoice', iso(-34, -1), 870_000)],
    }),
    appliance(now, {
      ...levi,
      id: 'lg-tv',
      name: 'טלוויזיה LG',
      category: 'tv',
      room: 'living',
      brand: 'LG',
      model: 'OLED55C4',
      serial: '410RMXX77231',
      endIn: { months: 3, days: 15 },
      warrantyMonths: 24,
      warrantySource: 'certificate',
      addedDaysAgo: 12,
      contacts: [contact('tv-importer', 'importer', 'LG ישראל', { phone: '1-800-000-000', primary: true })],
      documents: [
        fileRecord('tv-invoice', 'invoice', iso(-20, 15), 1_050_000),
        fileRecord('tv-certificate', 'warranty', iso(-20, 15), 720_000),
      ],
    }),
    appliance(now, {
      ...levi,
      id: 'bosch-dishwasher',
      name: 'מדיח כלים בוש',
      category: 'dishwasher',
      room: 'kitchen',
      brand: 'Bosch',
      model: 'SMS6ECI07E',
      endIn: { months: 14 },
      warrantyMonths: 24,
      addedDaysAgo: 60,
    }),
    appliance(now, {
      ...levi,
      id: 'electra-dryer',
      name: 'מייבש כביסה אלקטרה',
      category: 'laundry',
      room: 'laundry-room',
      brand: 'Electra',
      model: 'TD7800',
      endIn: { months: -2 },
      addedDaysAgo: 75,
      // האחריות הרגילה הסתיימה, והמורחבת מכסה: התו סופר עד סוף המורחבת (FR-3.3)
      extended: { provider: 'מחסני חשמל', start: iso(-2), end: iso(22), source: 'certificate' },
    }),
    appliance(now, {
      ...levi,
      id: 'induction-hob',
      name: 'כיריים אינדוקציה',
      category: 'oven',
      room: 'kitchen',
      brand: 'Bosch',
      model: 'PIE631FB1E',
      endIn: { months: 8 },
      warrantyMonths: 24,
      addedDaysAgo: 90,
    }),
    appliance(now, {
      ...levi,
      id: 'bedroom-ac',
      name: 'מזגן חדר שינה',
      category: 'ac',
      room: 'bedroom',
      brand: 'אלקטרה',
      endIn: { months: 24 },
      warrantyMonths: 36,
      addedDaysAgo: 100,
    }),
    appliance(now, {
      ...levi,
      id: 'jbl-speaker',
      name: 'רמקול JBL',
      category: 'tv',
      room: 'living',
      brand: 'JBL',
      model: 'Charge 5',
      endIn: { months: 7 },
      addedDaysAgo: 110,
    }),
    appliance(now, {
      ...levi,
      id: 'lenovo-laptop',
      name: 'מחשב נייד Lenovo',
      category: 'computer',
      room: 'office',
      brand: 'Lenovo',
      model: 'ThinkPad E14',
      endIn: { months: 10 },
      warrantyMonths: 36,
      addedDaysAgo: 120,
    }),
    appliance(now, {
      ...levi,
      id: 'samsung-phone',
      name: 'טלפון סמסונג',
      category: 'computer',
      room: 'other',
      brand: 'Samsung',
      model: 'Galaxy S24',
      endIn: { months: 6 },
      warrantyMonths: 24,
      addedDaysAgo: 130,
    }),
    appliance(now, {
      ...levi,
      id: 'dyson-vacuum',
      name: 'שואב אבק Dyson',
      category: 'vacuum',
      room: 'other',
      brand: 'Dyson',
      model: 'V12',
      endIn: { months: 16 },
      warrantyMonths: 24,
      addedDaysAgo: 140,
    }),
    appliance(now, {
      ...levi,
      id: 'coffee-machine',
      name: 'מכונת קפה נספרסו',
      category: 'small-kitchen',
      room: 'kitchen',
      brand: 'Nespresso',
      model: 'Vertuo',
      endIn: { months: 9 },
      warrantyMonths: 24,
      addedDaysAgo: 150,
    }),
    appliance(now, {
      ...levi,
      id: 'freezer',
      name: 'מקפיא אלקטרולוקס',
      category: 'fridge',
      room: 'laundry-room',
      brand: 'Electrolux',
      endIn: { months: 4 },
      warrantyMonths: 24,
      addedDaysAgo: 160,
    }),
    appliance(now, {
      ...levi,
      id: 'water-heater',
      name: 'דוד חשמל',
      category: 'other',
      room: 'bathroom',
      brand: 'כרומגן',
      endIn: { months: 30 },
      warrantyMonths: 60,
      addedDaysAgo: 170,
    }),
    appliance(now, {
      ...levi,
      id: 'dell-monitor',
      name: 'מסך מחשב Dell',
      category: 'computer',
      room: 'office',
      brand: 'Dell',
      model: 'U2723QE',
      endIn: { months: 26 },
      warrantyMonths: 36,
      addedDaysAgo: 180,
    }),
  ]
}

// [נכס, שם, קטגוריה, חדר, מותג, בעוד כמה חודשים מסתיימת האחריות — null = תאריך רכישה לא ידוע]
// שם הנכס לא חוזר בשם המכשיר: הנכס מוצג לידו (FR-7.3)
const RENTAL_APPLIANCES = [
  ['herzl', 'מזגן', 'ac', 'living', 'תדיראן', 20],
  ['herzl', 'מקרר', 'fridge', 'kitchen', 'Samsung', 14],
  ['herzl', 'מכונת כביסה', 'laundry', 'laundry-room', 'Bosch', 9],
  ['herzl', 'טלוויזיה', 'tv', 'living', 'LG', 7],
  ['herzl', 'מדיח כלים', 'dishwasher', 'kitchen', 'Bosch', 11],
  ['herzl', 'מיקרוגל', 'small-kitchen', 'kitchen', 'LG', 5],
  ['herzl', 'תנור', 'oven', 'kitchen', 'Electrolux', null],
  ['eilat', 'מזגן', 'ac', 'bedroom', 'אלקטרה', 26],
  ['eilat', 'מקרר', 'fridge', 'kitchen', 'LG', 18],
  ['eilat', 'מכונת כביסה', 'laundry', 'laundry-room', 'Samsung', 13],
  ['eilat', 'טלוויזיה', 'tv', 'living', 'Samsung', 16],
  ['eilat', 'שואב אבק', 'vacuum', 'other', 'Dyson', 8],
  ['eilat', 'מכונת קפה', 'small-kitchen', 'kitchen', 'Nespresso', 6],
  ['eilat', 'מדיח כלים', 'dishwasher', 'kitchen', 'Electrolux', 15],
  ['jaffa', 'מזגן', 'ac', 'living', 'תדיראן', 30],
  ['jaffa', 'מקרר', 'fridge', 'kitchen', 'Beko', 12],
  ['jaffa', 'כיריים', 'oven', 'kitchen', 'Bosch', 9],
  ['jaffa', 'טלוויזיה', 'tv', 'living', 'TCL', 21],
  ['jaffa', 'נתב Wi-Fi', 'computer', 'office', 'TP-Link', 4],
]

function createRentalAppliances(now) {
  return RENTAL_APPLIANCES.map(([propertyId, name, category, room, brand, months], index) =>
    appliance(now, {
      spaceId: 'rentals',
      propertyId,
      id: `rental-${index + 1}`,
      name,
      category,
      room,
      brand,
      endIn: months === null ? undefined : { months },
      warrantyMonths: 36,
      addedDaysAgo: 20 + index * 3,
      // בלי חשבונית ובלי תאריך: רק המתקין ידוע (F4)
      contacts:
        months === null
          ? [contact(`rental-${index + 1}-installer`, 'installer', 'אבי', { phone: '050-000-0000', primary: true })]
          : [],
    }),
  )
}

function createNotifications(now) {
  const at = (daysAgo) => addDays(now, -daysAgo).toISOString()
  return [
    // התראה לשולח בלבד (recipientId, FR-9.3)
    {
      id: 'notification-inbox-pdf',
      spaceId: 'levi',
      kind: 'space',
      tone: 'inbox',
      text: 'חשבונית שהעברתם במייל מחכה לבדיקה',
      createdAt: at(1),
      target: '/settings/forwarding',
      actorId: null,
      recipientId: 'noa',
      readBy: [],
    },
    {
      id: 'notification-washer-30',
      spaceId: 'levi',
      kind: 'warranty',
      tone: 'soon',
      text: 'האחריות על מכונת הכביסה LG מסתיימת בעוד 30 ימים',
      createdAt: at(6),
      target: '/appliances/lg-washer',
      actorId: null,
      readBy: [],
    },
    {
      id: 'notification-eyal-joined',
      spaceId: 'levi',
      kind: 'space',
      tone: 'member',
      text: 'אייל לוי הצטרף למרחב עם צפייה בלבד',
      createdAt: at(8),
      target: '/members',
      actorId: 'eyal',
      readBy: ['noa'],
    },
    {
      id: 'notification-fridge-added',
      spaceId: 'levi',
      kind: 'space',
      tone: 'added',
      text: 'מקרר סמסונג נוסף למרחב',
      createdAt: at(9),
      target: '/appliances/samsung-fridge',
      actorId: null,
      readBy: ['noa', 'eyal'],
    },
    {
      id: 'notification-mail-failed',
      spaceId: 'levi',
      kind: 'warranty',
      tone: 'error',
      text: 'לא הצלחנו לשלוח תזכורת במייל. ננסה שוב מחר.',
      createdAt: at(12),
      target: '/appliances/salon-ac',
      actorId: null,
      readBy: ['noa'],
    },
  ]
}

export function createInitialState() {
  const now = today()
  return {
    version: DEMO_VERSION,
    userId: 'noa',
    activeSpaceByUser: { noa: 'levi', eyal: 'levi' },
    users: createUsers(now),
    spaces: createSpaces(now),
    appliances: [...createLeviAppliances(now), ...createRentalAppliances(now)],
    notifications: createNotifications(now),
  }
}
