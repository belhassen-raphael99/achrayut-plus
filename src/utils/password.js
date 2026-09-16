import { MIN_PASSWORD_LENGTH } from './validation.js'

/**
 * חוזק סיסמה למד החוזק (A14, A15): 1 חלשה · 2 בינונית · 3 חזקה.
 * קצרה מ־8 תווים = חלשה. אחר כך לפי מגוון: אותיות, ספרות, סימנים, ואורך.
 */
export function passwordStrength(password) {
  if (!password) return { score: 0, label: '' }
  if (password.length < MIN_PASSWORD_LENGTH) return { score: 1, label: 'חלשה' }

  const variety = [/\p{L}/u, /\d/, /[^\p{L}\d]/u].filter((pattern) => pattern.test(password)).length

  if (variety === 3 || (variety === 2 && password.length >= 12)) return { score: 3, label: 'חזקה' }
  if (variety === 2) return { score: 2, label: 'בינונית' }
  return { score: 1, label: 'חלשה' }
}
