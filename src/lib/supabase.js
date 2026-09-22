/*
 * הלקוח של Supabase בדפדפן (שלב 8).
 * רק הכתובת והמפתח הציבורי מגיעים לכאן (CLAUDE.md, אבטחה): המפתחות הסודיים חיים ב־Edge Functions.
 * ההרשאות האמיתיות נאכפות ב־RLS, לא בקוד הזה.
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  throw new Error('חסרים VITE_SUPABASE_URL ו־VITE_SUPABASE_PUBLISHABLE_KEY (ראו .env.example)')
}

export const supabase = createClient(url, publishableKey, {
  auth: {
    // pkce: הקוד שבקישור מהמייל מוחלף לסשן בדפדפן שביקש אותו בלבד
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/** כתובת מלאה לחזרה מהמייל (אימות אימייל, איפוס סיסמה, Google) */
export function authRedirect(path) {
  return `${window.location.origin}${path}`
}
