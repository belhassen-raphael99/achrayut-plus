// טופס המכשיר: הזנה ידנית (N11), בדיקת הפרטים אחרי סריקה (N5, N13), ובהמשך עריכה (F8)

import { ESTIMATED_WARRANTY_MONTHS } from '../data/lists.js'
import { parseISODate, today } from './dates.js'
import { createId } from './ids.js'
import { isEmpty } from './validation.js'

export const DURATION_OPTIONS = [
  { id: '12', label: '12 חודשים' },
  { id: '24', label: '24 חודשים' },
  { id: '36', label: '36 חודשים' },
  { id: 'other', label: 'אחר' },
  { id: 'unknown', label: 'לא בטוחים' },
]

const PRESET_DURATIONS = ['12', '24', '36']

export const EMPTY_APPLIANCE_FORM = {
  name: '',
  category: '',
  brand: '',
  model: '',
  serial: '',
  room: '',
  purchaseDate: '',
  seller: '',
  duration: '12',
  customMonths: '',
  hasExtended: false,
  extendedProvider: '',
  extendedStart: '',
  extendedEnd: '',
}

/** רק «שם המכשיר» חובה; תאריך רכישה לא בעתיד (FR-2.8); אחריות מורחבת: סיום אחרי התחלה (FR-3.3) */
export function validateApplianceForm(values) {
  const errors = {}
  if (isEmpty(values.name)) errors.name = 'צריך לתת שם למכשיר, למשל: מקרר במטבח.'
  if (values.purchaseDate && parseISODate(values.purchaseDate) > today()) {
    errors.purchaseDate = 'תאריך הרכישה לא יכול להיות בעתיד.'
  }
  if (values.duration === 'other') {
    const months = Number(values.customMonths)
    if (!Number.isInteger(months) || months < 1) errors.customMonths = 'צריך להזין משך אחריות בחודשים, למשל 18.'
  }
  if (values.hasExtended) {
    if (isEmpty(values.extendedProvider)) errors.extendedProvider = 'צריך לכתוב מי נותן את האחריות המורחבת.'
    if (!values.extendedStart) errors.extendedStart = 'צריך להזין את תאריך ההתחלה.'
    if (!values.extendedEnd) errors.extendedEnd = 'צריך להזין את תאריך הסיום.'
    else if (values.extendedStart && values.extendedEnd <= values.extendedStart) {
      errors.extendedEnd = 'תאריך הסיום צריך להיות אחרי תאריך ההתחלה.'
    }
  }
  return errors
}

/** משך אחריות בחודשים → הבחירה בטופס. null (לא מופיע במסמך) → «לא בטוחים» */
export function durationFields(months) {
  if (!months) return { duration: 'unknown', customMonths: '' }
  const value = String(months)
  return PRESET_DURATIONS.includes(value)
    ? { duration: value, customMonths: '' }
    : { duration: 'other', customMonths: value }
}

/** תוצאת הקריאה → ערכי הטופס לבדיקה */
export function formFromScanResult(result) {
  return {
    ...EMPTY_APPLIANCE_FORM,
    name: result.name,
    category: result.category,
    brand: result.brand,
    model: result.model,
    serial: result.serial,
    purchaseDate: result.purchaseDate ?? '',
    seller: result.seller,
    ...durationFields(result.warrantyMonths),
  }
}

/** מכשיר קיים → ערכי טופס העריכה (F8). המוכר נערך כאיש קשר בכרטיס, ולכן לא כאן */
export function formFromAppliance(appliance) {
  return {
    ...EMPTY_APPLIANCE_FORM,
    name: appliance.name,
    category: appliance.category,
    brand: appliance.brand,
    model: appliance.model,
    serial: appliance.serial,
    room: appliance.room,
    purchaseDate: appliance.purchaseDate ?? '',
    ...(appliance.warrantySource === 'estimated'
      ? { duration: 'unknown', customMonths: '' }
      : durationFields(appliance.warrantyMonths)),
    hasExtended: Boolean(appliance.extended),
    extendedProvider: appliance.extended?.provider ?? '',
    extendedStart: appliance.extended?.start ?? '',
    extendedEnd: appliance.extended?.end ?? '',
  }
}

/** ערכי טופס העריכה → השינויים במכשיר. תאריך או משך ששונו ביד מקבלים «הוזן ידנית» (FR-3.7) */
export function applianceChangesFromForm(appliance, values) {
  const original = formFromAppliance(appliance)
  const changed = (fields) => fields.some((field) => values[field] !== original[field])
  const warrantyChanged = changed(['purchaseDate', 'duration', 'customMonths'])
  const extendedChanged = changed(['hasExtended', 'extendedProvider', 'extendedStart', 'extendedEnd'])

  return {
    name: values.name.trim(),
    category: values.category || 'other',
    room: values.room || 'other',
    brand: values.brand.trim(),
    model: values.model.trim(),
    serial: values.serial.trim(),
    purchaseDate: values.purchaseDate || null,
    warrantyMonths: warrantyMonthsFrom(values),
    warrantySource:
      values.duration === 'unknown' ? 'estimated' : warrantyChanged ? 'manual' : appliance.warrantySource,
    extended: values.hasExtended
      ? {
          provider: values.extendedProvider.trim(),
          start: values.extendedStart,
          end: values.extendedEnd,
          source: extendedChanged ? 'manual' : appliance.extended.source,
        }
      : null,
  }
}

function warrantyMonthsFrom(values) {
  if (values.duration === 'unknown') return ESTIMATED_WARRANTY_MONTHS
  if (values.duration === 'other') return Number(values.customMonths)
  return Number(values.duration)
}

/**
 * ערכי הטופס → מכשיר חדש.
 * warrantySource: מקור משך האחריות כשהוא לא שונה בטופס (למשל «מהחשבונית»); «לא בטוחים» → משוער לפי קטגוריה (FR-2.9).
 * המוכר שנכתב בטופס נשמר כאיש הקשר הראשי מסוג «מוכר» (FR-3.5).
 */
export function applianceFromForm(values, { spaceId, warrantySource = 'manual', documents = [] }) {
  const seller = values.seller.trim()

  return {
    id: createId('appliance'),
    spaceId,
    name: values.name.trim(),
    category: values.category || 'other',
    room: values.room || 'other',
    brand: values.brand.trim(),
    model: values.model.trim(),
    serial: values.serial.trim(),
    purchaseDate: values.purchaseDate || null,
    warrantyMonths: warrantyMonthsFrom(values),
    warrantySource: values.duration === 'unknown' ? 'estimated' : warrantySource,
    extended: values.hasExtended
      ? {
          provider: values.extendedProvider.trim(),
          start: values.extendedStart,
          end: values.extendedEnd,
          source: 'manual',
        }
      : null,
    contacts: seller
      ? [{ id: createId('contact'), type: 'seller', name: seller, phone: '', email: '', website: '', note: '', primary: true }]
      : [],
    documents,
    addedAt: new Date().toISOString(),
  }
}
