import { useContext } from 'react'
import { AuthContext } from './AuthContext.js'

/** הסשן של המשתמש המחובר והפעולות של ההתחברות (שלב 8) */
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth צריך לרוץ בתוך AuthProvider')
  return value
}
