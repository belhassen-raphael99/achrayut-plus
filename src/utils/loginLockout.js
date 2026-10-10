/*
 * חסימה אחרי 5 ניסיונות התחברות כושלים (A4, FR-1.2).
 * כאן זו שכבת ממשק בלבד, בדפדפן. האכיפה האמיתית תהיה בשרת (טבלת auth_lockouts ו־Hook של Supabase).
 */

const MAX_FAILED_ATTEMPTS = 5
const LOCK_MINUTES = 5
const STORAGE_KEY = 'achrayut-login-attempts'
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
    // אין sessionStorage (חלון פרטי): החסימה תחזיק רק עד רענון
  }
}

/** כמה מילישניות נשארו לחסימה (0 כשאין חסימה) */
export function lockRemainingMs() {
  return Math.max(0, readState().lockedUntil - Date.now())
}

export function isLoginLocked() {
  return lockRemainingMs() > 0
}

/** רושם ניסיון כושל ומחזיר 'locked' כשנגמרו הניסיונות, אחרת 'wrong' */
export function registerFailedLogin() {
  const state = readState()
  const failures = state.failures + 1
  if (failures >= MAX_FAILED_ATTEMPTS) {
    writeState({ failures: 0, lockedUntil: Date.now() + LOCK_MINUTES * 60 * 1000 })
    return 'locked'
  }
  writeState({ ...state, failures })
  return 'wrong'
}

export function clearFailedLogins() {
  writeState(EMPTY_STATE)
}

/** «החשבון נמחק» (P6): הדגל עובר בסשן מההגדרות למסך ההתחברות */
export const ACCOUNT_DELETED_KEY = 'achrayut-account-deleted'

export function readAccountDeletedFlag() {
  try {
    return sessionStorage.getItem(ACCOUNT_DELETED_KEY) === '1'
  } catch {
    return false
  }
}

/** אחרי שההודעה הוצגה: פעם אחת בלבד */
export function clearAccountDeletedFlag() {
  try {
    sessionStorage.removeItem(ACCOUNT_DELETED_KEY)
  } catch {
    // אין sessionStorage
  }
}

/** מונע הפניה החוצה מהאתר דרך ?next= (רק נתיב פנימי) */
export function safeNextPath(next) {
  // רק נתיב פנימי: בלי «//» או «/\» (דפדפנים הופכים \ ל־/), בלי רווחים או תווי בקרה, ובאותו מקור
  // eslint-disable-next-line no-control-regex -- תווי הבקרה נחסמים בכוונה
  if (typeof next !== 'string' || !next.startsWith('/') || /[\\\s\u0000-\u001f]/.test(next)) return null
  if (next[1] === '/') return null
  try {
    const url = new URL(next, window.location.origin)
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : null
  } catch {
    return null
  }
}
