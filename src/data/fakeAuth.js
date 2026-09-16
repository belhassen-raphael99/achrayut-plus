// שלב 6: התחברות מדומה, בלי שרת. בשלב 8 היא מוחלפת ב־Supabase Auth.
//
// חשבונות הדוגמה (הסיסמה של כולם: Warranty2026). המשתמשים עצמם ב־demoData.js:
//   noa@example.com        → נועה, גישה מלאה בשני מרחבים → דשבורד
//   eyal@example.com       → אייל, צפייה בלבד ב«משפחת לוי» → דשבורד (D4)
//   new@example.com        → רחל, בלי מרחב → כניסה ראשונה (O1)
//   unverified@example.com → «צריך לאמת את האימייל» (A5)
//   disabled@example.com   → «החשבון הזה מושבת» (A19)
// כל צירוף אחר → «האימייל או הסיסמה לא נכונים» (A2). 5 כישלונות ברצף → חסימה ל־5 דקות (A4).
// הסטטוס של חשבון נחשף רק אחרי סיסמה נכונה, כדי לא לגלות מי רשום (FR-1.2).

export const DEMO_PASSWORD = 'Warranty2026'

/** המשתמש שנכנס כשנרשמים או נכנסים עם Google בשלב 6 (משתמש חדש, בלי מרחב) */
export const NEW_DEMO_USER_ID = 'rachel'

const ACCOUNTS = {
  'noa@example.com': { status: 'active', userId: 'noa' },
  'eyal@example.com': { status: 'active', userId: 'eyal' },
  'new@example.com': { status: 'active', userId: 'rachel' },
  'unverified@example.com': { status: 'unverified' },
  'disabled@example.com': { status: 'disabled' },
}

const MAX_FAILED_ATTEMPTS = 5
const LOCK_MINUTES = 5
const STORAGE_KEY = 'achrayut-demo-login'
const EMPTY_STATE = { failures: 0, lockedUntil: 0 }

function readState() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) ?? EMPTY_STATE
  } catch {
    return EMPTY_STATE
  }
}

function writeState(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // אין sessionStorage (למשל חלון פרטי): החסימה תחזיק רק עד רענון
  }
}

/** כמה מילישניות נשארו לחסימה (0 כשאין חסימה) */
export function lockRemainingMs() {
  return Math.max(0, readState().lockedUntil - Date.now())
}

export function isLoginLocked() {
  return lockRemainingMs() > 0
}

/** מחזיר { status: 'success' | 'wrong' | 'locked' | 'unverified' | 'disabled', userId? } */
export function fakeLogin(email, password) {
  const state = readState()
  if (state.lockedUntil > Date.now()) return { status: 'locked' }

  const account = ACCOUNTS[email.trim().toLowerCase()]

  if (!account || password !== DEMO_PASSWORD) {
    const failures = state.failures + 1
    if (failures >= MAX_FAILED_ATTEMPTS) {
      writeState({ failures: 0, lockedUntil: Date.now() + LOCK_MINUTES * 60 * 1000 })
      return { status: 'locked' }
    }
    writeState({ ...state, failures })
    return { status: 'wrong' }
  }

  writeState(EMPTY_STATE)
  if (account.status !== 'active') return { status: account.status }
  return { status: 'success', userId: account.userId }
}

/** מונע הפניה החוצה מהאתר דרך ?next= (רק נתיב פנימי) */
export function safeNextPath(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : null
}
