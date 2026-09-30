// שלבי הקריאה, ותוצאות מדומות שנשארו רק להעברת חשבוניות במייל (FR-9, עדיין מדומה).
// קריאת החשבונית עצמה נעשית מ־8.5 ב־Edge Function שקוראת ל־Claude ובודקת את התשובה מול סכמה (NFR-6).
// uncertain = שדות שהקריאה לא ודאית בהם → תג «לבדוק» (FR-2.5). warrantyMonths: null = לא מופיע → משוער.

import { addDays, toISODate, today } from '../utils/dates.js'

/** שלבי הקריאה (N4). צילום התווית קורא תווית, לא חשבונית */
export function analysisSteps(source) {
  return [
    source === 'pdf' ? 'הקובץ הועלה' : 'התמונה הועלתה',
    source === 'label' ? 'קוראים את התווית…' : 'קוראים את החשבונית…',
    'מזהים את המוצר ואת האחריות',
    'מכינים את הפרטים לבדיקה',
  ]
}

/** צילום חשבונית עם מכשיר אחד (N5) */
export function invoiceResult() {
  return {
    name: 'מקרר סמסונג',
    category: 'fridge',
    brand: 'Samsung',
    model: 'RB38T602DWW',
    serial: '',
    purchaseDate: toISODate(addDays(today(), -14)),
    seller: 'מחסני חשמל',
    warrantyMonths: null,
    uncertain: ['model'],
  }
}

/** PDF עם כמה מכשירים (N6): בוחרים אחד, והשאר אפשר להוסיף אחר כך בלי סריקה נוספת (FR-2.6) */
export function multiInvoiceResults() {
  const purchaseDate = toISODate(addDays(today(), -20))
  const common = { purchaseDate, seller: 'מחסני חשמל', serial: '', uncertain: [] }
  return [
    { ...common, id: 'line-fridge', line: 'מקרר סמסונג RB38', price: 3490, name: 'מקרר סמסונג', category: 'fridge', brand: 'Samsung', model: 'RB38T602DWW', warrantyMonths: 24 },
    { ...common, id: 'line-microwave', line: 'מיקרוגל LG MS23', price: 590, name: 'מיקרוגל LG', category: 'small-kitchen', brand: 'LG', model: 'MS23', warrantyMonths: 12 },
    { ...common, id: 'line-vacuum', line: 'שואב אבק דייסון V12', price: 2290, name: 'שואב אבק דייסון', category: 'vacuum', brand: 'Dyson', model: 'V12', warrantyMonths: null },
  ]
}
