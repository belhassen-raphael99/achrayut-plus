// בדיקות טפסים בצד הלקוח. בשלב 8 אותן בדיקות ייעשו גם בשרת.
// הנוסחים לפי ה־prompts של Stitch (A3, A8, A15).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export const EMPTY_EMAIL_MESSAGE = 'צריך להזין אימייל.'
export const INVALID_EMAIL_MESSAGE = 'כתובת האימייל לא תקינה. בדקו שאין רווח או טעות הקלדה.'
export const EMPTY_PASSWORD_MESSAGE = 'צריך להזין סיסמה.'
export const SHORT_PASSWORD_MESSAGE = `הסיסמה קצרה מדי. צריך לפחות ${MIN_PASSWORD_LENGTH} תווים.`

export function isEmpty(value) {
  return value.trim() === ''
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim())
}

/** «יש שדה אחד לתיקון» / «יש 3 שדות לתיקון» */
export function errorSummary(count) {
  return count === 1 ? 'יש שדה אחד לתיקון' : `יש ${count} שדות לתיקון`
}
