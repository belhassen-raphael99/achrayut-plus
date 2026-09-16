// קוד הזמנה למרחב: 6 תווים (PRD FR-1.4, FR-1.5)

export const INVITE_CODE_LENGTH = 6

/** «blh-4k2 » → «BLH4K2»: אותיות לטיניות וספרות בלבד, באותיות גדולות, עד 6 תווים */
export function normalizeInviteCode(value) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, INVITE_CODE_LENGTH)
}

// בלי תווים שקל לבלבל ביניהם (0/O, 1/I)
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** קוד חדש שלא קיים עדיין (M2). בשלב 8 הקוד נוצר בשרת */
export function generateInviteCode(existingCodes = []) {
  let code
  do {
    code = Array.from({ length: INVITE_CODE_LENGTH }, () =>
      CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)],
    ).join('')
  } while (existingCodes.includes(code))
  return code
}

/** «BLH4K2» → «BLH-4K2», לתצוגה (M2) */
export function formatInviteCode(code) {
  return `${code.slice(0, 3)}-${code.slice(3)}`
}
