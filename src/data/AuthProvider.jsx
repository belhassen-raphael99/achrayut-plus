import { useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext.js'
import { authRedirect, supabase } from '../lib/supabase.js'

/**
 * ההתחברות האמיתית (שלב 8, PRD M1): Supabase Auth מחזיק את האימייל, הסיסמה, Google והאימות.
 * הפרופיל (שם, טלפון, תזכורות) נקרא מהטבלה profiles — רק הבעלים רואה אותה (RLS).
 */

/** שגיאת התחברות → המצב שהמסך מכיר (A2, A5, A19). אותה הודעה לאימייל שלא קיים ולסיסמה שגויה (FR-1.2) */
function loginStatus(error) {
  const code = error?.code ?? ''
  if (code === 'email_not_confirmed') return 'unverified'
  if (code === 'user_banned') return 'disabled'
  return 'wrong'
}

function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  // שומרים למי שייך הפרופיל, כדי לא להציג פרופיל של משתמש קודם אחרי החלפה
  const [loadedProfile, setLoadedProfile] = useState({ userId: null, data: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session ?? null)
      setLoading(false)
    })

    // מכסה גם את הקוד שמגיע בקישור מהמייל (אימות והחלפת סיסמה)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setLoadedProfile({ userId, data: data ?? null })
      })
    return () => {
      active = false
    }
  }, [userId])

  const profile = loadedProfile.userId === userId ? loadedProfile.data : null

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,

      /** הרשמה באימייל (FR-1.1). השם נשמר ב־metadata, וטריגר בשרת יוצר את הפרופיל ואת המנוי החינמי */
      async signUp({ firstName, lastName, email, password }) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { first_name: firstName.trim(), last_name: lastName.trim() },
            emailRedirectTo: authRedirect('/verify-email'),
          },
        })
        return { ok: !error, error }
      },

      /** מחזיר { status: 'success' | 'wrong' | 'unverified' | 'disabled' } */
      async signIn(email, password) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        return { status: error ? loginStatus(error) : 'success' }
      },

      /** Google (FR-1.1). כישלון או ביטול חוזרים למסך ההתחברות בלי שגיאה טכנית (A6) */
      async signInWithGoogle(next) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: authRedirect(next ?? '/dashboard') },
        })
        return { ok: !error, error }
      },

      /** שליחה חוזרת של קישור האימות (A5, A9) */
      async resendVerification(email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.trim(),
          options: { emailRedirectTo: authRedirect('/verify-email') },
        })
        return { ok: !error, error }
      },

      /** «שכחתי סיסמה» (FR-1.3). אותה תשובה גם כשאין חשבון: לא מגלים מי רשום */
      async requestPasswordReset(email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: authRedirect('/reset-password'),
        })
        return { ok: !error, error }
      },

      /** סיסמה חדשה. אחריה מתנתקים משאר המכשירים (FR-1.9) */
      async updatePassword(password) {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) return { ok: false, error }
        await supabase.auth.signOut({ scope: 'others' })
        return { ok: true, error: null }
      },

      async signOut() {
        await supabase.auth.signOut()
      },
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
