import { useContext } from 'react'
import { AppDataContext } from './AppDataContext.js'

/** המשתמש, המרחב הפעיל, המכשירים והפעולות (שלב 6: בלי שרת) */
export function useAppData() {
  const value = useContext(AppDataContext)
  if (!value) throw new Error('useAppData צריך לרוץ בתוך AppDataProvider')
  return value
}
