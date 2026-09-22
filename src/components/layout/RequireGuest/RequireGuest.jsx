import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../../../data/useAuth.js'
import { safeNextPath } from '../../../utils/loginLockout.js'

/** התחברות והרשמה: מי שכבר מחובר לא רואה אותן שוב */
function RequireGuest() {
  const { session, loading } = useAuth()

  if (loading) return null

  if (session) {
    const next = safeNextPath(new URLSearchParams(window.location.search).get('next'))
    return <Navigate to={next ?? '/dashboard'} replace />
  }

  return <Outlet />
}

export default RequireGuest
