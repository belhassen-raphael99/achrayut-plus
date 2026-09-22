import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../../data/useAuth.js'

/**
 * שער האפליקציה (FR-1.2, FR-5.4): בלי סשן חוזרים להתחברות, ואחריה חזרה לאותו עמוד.
 * הסתרת עמוד היא חוויית משתמש בלבד; ההרשאות האמיתיות הן ה־RLS בשרת.
 */
function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  // בזמן בדיקת הסשן לא מציגים כלום, כדי לא להבהב בין הדף להתחברות
  if (loading) return null

  if (!session) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }

  return <Outlet />
}

export default RequireAuth
